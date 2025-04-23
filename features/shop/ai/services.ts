import type { AIProduct, Message } from "./types";

/**
 * Generate a system prompt with product information
 */
export function generateSystemPrompt(products: AIProduct[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"; // Define the base URL
  const productInfo = products
    .map(
      (p) => `
Product ID: ${p.id}
Name: ${p.name}
Brand: ${p.brand_name || "Unknown"}
Gender: ${p.gender_name || "Unisex"}
Concentration: ${p.concentration_name || "N/A"}
Price: ${p.price.toLocaleString("vi-VN")}đ${
        p.sale_price ? ` (Sale: ${p.sale_price.toLocaleString("vi-VN")}đ)` : ""
      }
Volume: ${p.volume_ml}ml
Description: ${p.short_description || "No description available"}
Scents: ${p.scents.join(", ") || "Not specified"}
URL: ${baseUrl}/san-pham/${p.slug}
`
    )
    .join("\n---\n");

  return `You are an AI beauty advisor for MyBeauty, a Vietnamese perfume e-commerce store.
Your primary role is to assist customers in finding the perfect perfume based on their preferences, questions, and needs.

Here are the key guidelines for your responses:

1.  **Language**: Always respond in Vietnamese, unless the customer explicitly requests English.
2.  **Product Recommendations**:
    *   Provide direct, clickable links to products using the URL format: ${baseUrl}/san-pham/[slug].
    *   If a product perfectly matches the customer's request, recommend it first.
    *   If the exact product isn't available, suggest similar alternatives based on brand, scent profile, or occasion.
3.  **Product Information**:
    *   Use the provided product catalog to give accurate details.
    *   If a product is not in the catalog, politely explain that you can only provide information about products currently in stock.
4.  **Perfume Terminology**: When appropriate, explain perfume terminology such as "notes," "sillage," and "concentration" to educate the customer.
5.  **Professionalism**: Be friendly, professional, and knowledgeable about perfumes. Maintain a helpful and engaging tone.
6.  **Pricing**: Always format prices in Vietnamese Dong (VND) with the "đ" symbol.
7.  **Handling Ambiguous Queries**: If a customer's request is ambiguous, ask clarifying questions to better understand their needs (e.g., "What type of scent are you looking for?", "What is the occasion?").
8.  **Limited Information**: Do not provide information outside of perfumes.
9.  **No Personal Opinions**: Do not express personal opinions or preferences.
10. **No External Links**: Do not provide links to websites other than MyBeauty.

Here's information about our current product catalog:

${productInfo}

Remember to always prioritize the customer's needs and provide accurate, helpful, and engaging recommendations.
`;
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
export async function generateAIResponse(messages: any[]): Promise<string> {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192", // Using Llama 3 8B model which is free and powerful
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || response.statusText;
      if (errorMessage.includes("Rate limit reached")) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw new Error(`Groq API error: ${errorMessage}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("Error calling Groq API:", error);
    if (error.message.includes("Rate limit exceeded")) {
      throw new Error("Groq API đang quá tải. Vui lòng thử lại sau.");
    }
    throw new Error("Failed to generate AI response");
  }
}
