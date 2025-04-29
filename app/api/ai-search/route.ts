import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { formatMessagesForGroq } from "@/features/shop/ai/services";
import { callGroqAPI, getGroqModel } from "@/lib/utils/ai-models";

export const runtime = "edge";

// English system prompt for AI product search suggestions
const SEARCH_SYSTEM_PROMPT = `You are an AI product search assistant for MyBeauty perfume store.
Your ONLY task is to suggest relevant perfume products based on user search queries.
This is a quick suggestion feature, NOT a conversational chatbot.

You MUST ALWAYS respond with a valid JSON array with EXACTLY this format:
[
  {
    "id": "<product_id>",
    "name": "<product_name>",
    "relevance": "<short reason why this product matches the query (max 50 chars in Vietnamese)>"
  },
  // ... maximum 5 products
]

STRICT RULES:
1. NEVER return any text outside the valid JSON array
2. NO conversational responses or explanations
3. ALWAYS return an empty array [] if no matching products found
4. MAXIMUM 5 product suggestions
5. ONLY suggest products from the provided product list
6. The "relevance" field must be brief (max 50 chars) and IN VIETNAMESE

PRIORITIZE results based on:
1. Relevance to search terms (product name, brand, scent profile)
2. Popularity (if available)
3. Diversity of brands and perfume types

PRODUCT CATALOG:
{products_info}

Violating any rules will break the integration and the feature will not work correctly.`;

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Rate limiting check - implement a simple timestamp-based approach
    // This would ideally be implemented with a proper rate limiting service
    const timestamp = Date.now();
    const minRequestInterval = 300; // milliseconds between requests

    // Use Service Role Client to bypass RLS
    const supabase = await createServiceRoleClient();

    // Get product data for AI context
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id, 
        name,
        slug,
        short_description,
        brands (name),
        perfume_types (name),
        genders (name),
        concentrations (name),
        product_variants (
          id, 
          price, 
          sale_price, 
          volume_ml, 
          stock_quantity, 
          deleted_at
        ),
        product_images (
          image_url, 
          is_main
        ),
        product_scents (
          scents (name)
        ),
        product_ingredients (
          ingredients (name),
          scent_type
        )
      `
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      console.error("Database error fetching products:", error);
      return NextResponse.json({ suggestions: [] }, { status: 500 });
    }

    if (!products || products.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Format product info for AI prompt
    const productsInfo = products
      .map((product: any) => {
        // Find main image
        const mainImage =
          product.product_images?.find((img: any) => img.is_main === true) ||
          product.product_images?.[0];

        // Find valid variants (with price, in stock)
        const validVariants =
          product.product_variants?.filter(
            (v: any) =>
              typeof v.price === "number" &&
              v.deleted_at === null &&
              v.stock_quantity > 0
          ) || [];

        if (validVariants.length === 0) return null;

        const bestVariant = validVariants[0];

        // Group scents by type
        const scentsByType: Record<string, string[]> = {};
        product.product_ingredients?.forEach((pi: any) => {
          const type = pi.scent_type || "unspecified";
          if (!scentsByType[type]) scentsByType[type] = [];
          if (pi.ingredients?.name) {
            scentsByType[type].push(pi.ingredients.name);
          }
        });

        // Format scent notes by type
        const scentNotes = Object.entries(scentsByType)
          .map(([type, notes]) => `${type}: ${notes.join(", ")}`)
          .join("; ");

        // List scent groups
        const scents =
          product.product_scents
            ?.map((ps: any) => ps.scents?.name)
            .filter(Boolean) || [];

        return {
          id: product.id,
          name: product.name,
          brand: product.brands?.name || "Unknown",
          gender: product.genders?.name || "Unisex",
          type: product.perfume_types?.name || "Unknown",
          concentration: product.concentrations?.name || "Unknown",
          price: bestVariant.price,
          sale_price: bestVariant.sale_price,
          volume: bestVariant.volume_ml,
          description: product.short_description,
          scents: scents.join(", "),
          notes: scentNotes,
        };
      })
      .filter(Boolean);

    if (productsInfo.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Replace placeholder in system prompt with actual product data
    const systemPrompt = SEARCH_SYSTEM_PROMPT.replace(
      "{products_info}",
      JSON.stringify(productsInfo, null, 2)
    );

    // Format messages for Groq API
    const messages = formatMessagesForGroq([
      {
        id: "system",
        role: "system",
        content: systemPrompt,
        createdAt: new Date(),
      },
      { id: "user", role: "user", content: query, createdAt: new Date() },
    ]);

    try {
      // Get the current model being used
      const currentModel = getGroqModel();

      // Sử dụng hàm callGroqAPI từ thư viện tiện ích mới
      const groqResponse = await callGroqAPI(messages, {
        temperature: 0.2, // Low temperature for consistent results
        max_tokens: 1024,
        stream: false,
      });

      if (!groqResponse.ok) {
        console.error("Error from Groq API", await groqResponse.text());
        return NextResponse.json({ suggestions: [] }, { status: 500 });
      }

      const groqData = await groqResponse.json();

      // Extract response
      const aiResponse = groqData?.choices?.[0]?.message?.content;

      if (!aiResponse) {
        return NextResponse.json({ suggestions: [] });
      }

      // Parse JSON from AI response
      let aiSuggestions;
      try {
        // Find and extract JSON array from response
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          aiSuggestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No valid JSON array found in response");
        }
      } catch (e) {
        console.error(
          "Error parsing AI response:",
          e,
          "\nRaw AI response:",
          aiResponse
        );
        aiSuggestions = [];
      }

      if (!Array.isArray(aiSuggestions)) {
        console.error("AI response is not an array:", aiSuggestions);
        return NextResponse.json({ suggestions: [] });
      }

      // Extract product IDs suggested by AI
      const suggestedProductIds = aiSuggestions
        .map((item: any) => item.id)
        .filter(Boolean);

      if (suggestedProductIds.length === 0) {
        return NextResponse.json({ suggestions: [] });
      }

      // Fetch complete product data for the suggested products
      const { data: suggestedProducts, error: suggestError } = await supabase
        .from("products")
        .select(
          `
        id, 
        name,
        slug,
        brands (name),
        product_variants (
          price, 
          sale_price
        ),
        product_images (
          image_url, 
          is_main
        )
      `
        )
        .in("id", suggestedProductIds)
        .is("deleted_at", null);

      if (suggestError) {
        console.error("Error fetching suggested products:", suggestError);
        return NextResponse.json({ suggestions: [] }, { status: 500 });
      }

      // Format final suggestions with complete data
      const finalSuggestions = suggestedProducts.map((product: any) => {
        // Find main image
        const mainImage =
          product.product_images?.find((img: any) => img.is_main === true) ||
          product.product_images?.[0];

        // Find variant with lowest price
        const variant = product.product_variants?.reduce((min: any, v: any) => {
          if (
            !min ||
            (v.sale_price || v.price) < (min.sale_price || min.price)
          ) {
            return v;
          }
          return min;
        }, null);

        // Find AI relevance information
        const aiSuggestion = aiSuggestions.find((s: any) => s.id == product.id);

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image_url: mainImage?.image_url || "/placeholder.jpg",
          price: variant?.price || 0,
          sale_price: variant?.sale_price || null,
          brand_name: product.brands?.name || "",
          relevance: aiSuggestion?.relevance || "Sản phẩm phù hợp",
        };
      });

      // Add timestamp and model information to track request timing and model used
      return NextResponse.json({
        suggestions: finalSuggestions,
        source: "ai",
        timestamp: timestamp,
        modelUsed: currentModel, // Trả về model đang được sử dụng
      });
    } catch (error) {
      console.error("Error in Groq API call:", error);
      return NextResponse.json(
        {
          suggestions: [],
          error: "Failed to generate AI response",
          timestamp: timestamp,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("AI search suggestion error:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
