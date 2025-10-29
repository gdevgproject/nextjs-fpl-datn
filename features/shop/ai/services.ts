// File: services.ts (hoặc file chứa hàm generateSystemPrompt của bạn)

import type { AIProduct, Message } from "./types";

/**
 * Generate an optimized and compact system prompt with product information in JSON format.
 */
export function generateSystemPrompt(
  products: AIProduct[],
  profile?: any,
  cart?: any,
  wishlist?: any,
  shopSettings?: any
): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // --- Phần thông tin người dùng, giỏ hàng, wishlist được giữ nguyên vì đã khá tối ưu ---
  let profileInfo = "Chưa đăng nhập";
  let userName = "bạn";
  if (profile) {
    profileInfo = [
      profile.display_name ? `Tên: ${profile.display_name}` : null,
      profile.gender ? `Giới tính: ${profile.gender}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    if (profile.display_name) {
      userName = profile.display_name.split(" ").slice(-1)[0];
    }
  }

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

  let wishlistInfo = "Chưa có sản phẩm yêu thích.";
  if (wishlist && Array.isArray(wishlist) && wishlist.length > 0) {
    wishlistInfo = wishlist
      .map((item: any) => {
        const prod = item.product || item;
        return `- ${prod.name} (${prod.brand?.name || prod.brand_name || "?"})`;
      })
      .join("\n");
  }

  let shopInfo = shopSettings
    ? `Tên shop: ${shopSettings.shop_name || "MyBeauty"}, Hotline: ${
        shopSettings.contact_phone || "N/A"
      }`
    : "";

  // --- TỐI ƯU HÓA PHẦN THÔNG TIN SẢN PHẨM ---
  // Chuyển đổi danh sách sản phẩm thành một mảng các đối tượng gọn nhẹ hơn
  const compactProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug, // Giữ lại slug để AI tạo URL
    brand: p.brand_name,
    gender: p.gender_name,
    type: p.type,
    conc: p.concentration_name, // Viết tắt concentration
    price: p.price,
    sale_price: p.sale_price,
    vol: p.volume_ml, // Viết tắt volume_ml
    desc: (p.short_description || p.description || "").substring(0, 150), // Cắt ngắn mô tả
    scents: p.scents,
    notes: p.notes,
    // Chuyển đổi variants thành định dạng gọn hơn
    variants: p.variants?.map((v) => ({
      id: v.id,
      vol: v.volume_ml,
      price: v.price,
      sale_pr: v.sale_price, // Viết tắt
      stock: v.stock_quantity,
    })),
  }));

  // Chuyển mảng đối tượng thành một chuỗi JSON được nén
  const productInfoJson = JSON.stringify(compactProducts);

  const systemPrompt = `You are an AI beauty advisor for MyBeauty, a Vietnamese perfume e-commerce store.

STRICT RULES:
- ONLY answer questions about perfumes sold at MyBeauty based on the provided JSON catalog.
- DO NOT answer questions about unrelated topics, other brands, or competitors.
- DO NOT invent or hallucinate products or information.
- If the user asks about something not in the catalog, politely inform them it's unavailable.
- DO NOT provide personal opinions or external links.

IMPORTANT: Each product may have multiple variants in the 'variants' array (different volumes, prices, stock). Always refer to the correct variant that matches the user's request.

${shopInfo ? `Shop info: ${shopInfo}` : ""}
User info: ${profileInfo}
Cart:
${cartInfo}
Wishlist:
${wishlistInfo}

You should address the user by their name "${userName}" (if available) for a personalized experience.

Guidelines:
1.  **Language**: Always respond in Vietnamese.
2.  **Product Links**: Provide direct, clickable links to products using the 'slug' from the JSON data, with the format: ${baseUrl}/san-pham/[slug].
3.  **Product Info**: Use the provided JSON product catalog to give accurate details. When mentioning price, volume, or stock, always specify the correct variant from the 'variants' array.
4.  **Professionalism**: Be friendly, professional, and knowledgeable.
5.  **Pricing**: Always format prices in Vietnamese Dong (VND) with the "đ" symbol.
6.  **Clarification**: If a query is ambiguous, ask clarifying questions.

Here is the current product catalog in a compact JSON format. You MUST use this data as your ONLY source of truth:

${productInfoJson}

Always prioritize the customer's needs and provide accurate, helpful recommendations based ONLY on the provided JSON catalog.
`;

  // Log system prompt để debug (có thể tắt ở production)
  // console.log("=== [AI SYSTEM PROMPT SENT TO AI CHAT BOT] ===\n", systemPrompt);

  return systemPrompt;
}

// --- CÁC HÀM KHÁC GIỮ NGUYÊN ---

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
  const UPDATE_FREQUENCY = 50; // ms between UI updates

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
              const now = Date.now();
              if (now - lastUpdateTime >= UPDATE_FREQUENCY || doneReading) {
                lastUpdateTime = now;
                if (onStream) onStream(result);
              }
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    }
  }

  if (onStream) onStream(result);
  return result;
}
