import type { AIProduct, Message } from "./types";

/**
 * Generate a system prompt with product information
 */
export function generateSystemPrompt(
  products: AIProduct[],
  profile?: any,
  cart?: any,
  wishlist?: any,
  shopSettings?: any
): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"; // Define the base URL

  // Thông tin profile
  let profileInfo = "Chưa đăng nhập";
  let userName = "bạn";
  if (profile) {
    profileInfo = [
      profile.display_name ? `Tên: ${profile.display_name}` : null,
      profile.gender ? `Giới tính: ${profile.gender}` : null,
      profile.birthday ? `Ngày sinh: ${profile.birthday}` : null,
      profile.email ? `Email: ${profile.email}` : null,
      profile.phone_number ? `SĐT: ${profile.phone_number}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    if (profile.display_name) {
      userName = profile.display_name.split(" ").slice(-1)[0]; // Lấy tên cuối cùng
    }
  }

  // Thông tin giỏ hàng
  let cartInfo = "Chưa có sản phẩm nào trong giỏ hàng.";
  if (cart && Array.isArray(cart) && cart.length > 0) {
    cartInfo = cart
      .map((item: any) => {
        const prod = item.product || item;
        return `- ${prod.name} (${prod.volume_ml || prod.volumeMl || "?"}ml) x${
          item.quantity
        }`;
      })
      .join("\n");
  }

  // Thông tin wishlist
  let wishlistInfo = "Chưa có sản phẩm yêu thích.";
  if (wishlist && Array.isArray(wishlist) && wishlist.length > 0) {
    wishlistInfo = wishlist
      .map((item: any) => {
        const prod = item.product || item;
        return `- ${prod.name} (${prod.brand?.name || prod.brand_name || "?"})`;
      })
      .join("\n");
  }

  // Thông tin shop
  let shopInfo = shopSettings
    ? `Tên shop: ${shopSettings.shop_name || "MyBeauty"}, Hotline: ${
        shopSettings.contact_phone || "N/A"
      }`
    : "";

  const productInfo = products
    .map(
      (p) => `
Product ID: ${p.id}
Name: ${p.name}
Brand: ${p.brand_name || "Unknown"}
Brand Logo: ${p.brand_logo_url || "N/A"}
Gender: ${p.gender_name || "Unisex"}
Type: ${p.type || "Unknown"}
Concentration: ${p.concentration_name || "N/A"}
Release Year: ${p.release_year || "N/A"}
Origin Country: ${p.origin_country || "N/A"}
Style: ${p.style || "N/A"}
Sillage: ${p.sillage || "N/A"}
Longevity: ${p.longevity || "N/A"}
Product Code: ${p.product_code || "N/A"}
Categories: ${(p.category_names || []).join(", ") || "N/A"}
Price: ${p.price.toLocaleString("vi-VN")}đ${
        p.sale_price ? ` (Sale: ${p.sale_price.toLocaleString("vi-VN")}đ)` : ""
      }
Volume: ${p.volume_ml}ml
Description: ${
        p.short_description || p.description || "No description available"
      }
Scents: ${p.scents.join(", ") || "Not specified"}
Notes: ${p.notes || "N/A"}
Main Image: ${p.main_image_url || p.image_url || "N/A"}
Image URL: ${p.image_url || p.main_image_url || "N/A"}
${
  p.variants && p.variants.length > 0
    ? `Variants: [${p.variants
        .map(
          (v) =>
            `{id: ${v.id}, volume_ml: ${v.volume_ml}, price: ${v.price}, sale_price: ${v.sale_price}, stock_quantity: ${v.stock_quantity}}`
        )
        .join(", ")}]`
    : ""
}
URL: ${baseUrl}/san-pham/${p.slug}
`
    )
    .join("\n---\n");

  const systemPrompt = `You are an AI beauty advisor for MyBeauty, a Vietnamese perfume e-commerce store.

STRICT RULES:
- ONLY answer questions about perfumes sold at MyBeauty.
- DO NOT answer questions about unrelated topics, other brands, or competitors.
- DO NOT invent or hallucinate products, information, or brands.
- ONLY recommend or mention products that exist in the provided product catalog.
- If the user asks about a product, year, or attribute that does not exist in the catalog, politely inform them that it is not available and DO NOT suggest unrelated alternatives.
- DO NOT provide information about products, brands, or shops not present in the product catalog below.
- DO NOT provide personal opinions or external links.

IMPORTANT: Each product may have multiple variants (different volumes, prices, sale prices, and stock quantities). When answering, always refer to the correct variant that matches the user's request (e.g., if the user asks for 100ml, show the price and stock for the 100ml variant). Do NOT assume a product only has one price or volume.

${shopInfo ? `Shop info: ${shopInfo}` : ""}
User info: ${profileInfo}
Cart: 
${cartInfo}
Wishlist: 
${wishlistInfo}

You should address the user by their name "${userName}" (if available) in your responses for a more personalized experience.

Guidelines:
1.  **Language**: Always respond in Vietnamese, unless the customer explicitly requests English.
2.  **Product Recommendations**:
    *   Provide direct, clickable links to products using the URL format: ${baseUrl}/san-pham/[slug].
    *   If a product perfectly matches the customer's request, recommend it first.
    *   If the exact product isn't available, only suggest similar alternatives that are present in the catalog and clearly state the difference.
3.  **Product Information**:
    *   Use the provided product catalog to give accurate details.
    *   If a product is not in the catalog, politely explain that you can only provide information about products currently in stock.
    *   When mentioning price, volume, or stock, always specify the correct variant.
4.  **Perfume Terminology**: When appropriate, explain perfume terminology such as "notes," "sillage," and "concentration" to educate the customer.
5.  **Professionalism**: Be friendly, professional, and knowledgeable about perfumes. Maintain a helpful and engaging tone.
6.  **Pricing**: Always format prices in Vietnamese Dong (VND) with the "đ" symbol.
7.  **Handling Ambiguous Queries**: If a customer's request is ambiguous, ask clarifying questions to better understand their needs (e.g., "What type of scent are you looking for?", "What is the occasion?").
8.  **Limited Information**: Do not provide information outside of perfumes.
9.  **No Personal Opinions**: Do not express personal opinions or preferences.
10. **No External Links**: Do not provide links to websites other than MyBeauty.

Here is the current product catalog (all information is accurate and up-to-date):

${productInfo}

Always prioritize the customer's needs and provide accurate, helpful, and engaging recommendations. Never provide information or suggestions outside the provided product catalog.
`;

  // Log toàn bộ system prompt và dữ liệu truyền vào AI chat bot
  console.log("=== [AI SYSTEM PROMPT SENT TO AI CHAT BOT] ===\n", systemPrompt);

  return systemPrompt;
}

/**
 * Format messages for the Groq API
 */
export function formatMessagesForGroq(messages: Message[]): any[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

/**
 * Call the Groq API to generate a response
 */
export async function generateAIResponse(
  messages: any[],
  onStream?: (text: string) => void
): Promise<string> {
  const response = await fetch("/api/groq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = "";
  let done = false;
  let lastUpdateTime = Date.now();
  const UPDATE_FREQUENCY = 50; // ms between UI updates to prevent too frequent re-renders

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });

      // Process each line in the chunk
      for (const line of chunk.split("\n")) {
        if (line.trim().startsWith("data:")) {
          const json = line.replace(/^data:/, "").trim();
          if (json === "[DONE]") continue;

          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content || "";

            if (delta) {
              // Add to our accumulated result
              result += delta;

              // Control update frequency to avoid overwhelming the UI
              const now = Date.now();
              if (now - lastUpdateTime >= UPDATE_FREQUENCY || doneReading) {
                lastUpdateTime = now;
                if (onStream) onStream(result);
              }
            }
          } catch (e) {
            // Silently ignore parsing errors from incomplete chunks
          }
        }
      }
    }
  }

  // Always ensure the final result is sent at once at the end
  if (onStream) onStream(result);
  return result;
}
