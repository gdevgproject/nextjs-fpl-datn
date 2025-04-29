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

${shopInfo ? `Shop info: ${shopInfo}` : ""}
User info: ${profileInfo}
Cart: \n${cartInfo}
Wishlist: \n${wishlistInfo}

You should address the user by their name "${userName}" (if available) in your responses for a more personalized experience.

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

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        if (line.trim().startsWith("data:")) {
          const json = line.replace(/^data:/, "").trim();
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content || "";
            if (delta) {
              result += delta;
              // Only trigger onStream callback if there's a meaningful change
              // and limit update frequency to prevent re-render storms
              if (onStream && delta.length > 0) onStream(result);
            }
          } catch (e) {
            // Silently ignore parsing errors from incomplete chunks
          }
        }
      }
    }
  }
  
  // Ensure final result is sent once more at the end
  if (onStream) onStream(result);
  return result;
}
