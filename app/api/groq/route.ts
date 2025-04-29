import { NextRequest } from "next/server";
import { callGroqAPI } from "@/lib/utils/ai-models";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  try {
    // Sử dụng hàm callGroqAPI từ thư viện tiện ích mới
    const groqRes = await callGroqAPI(messages, {
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    });

    // Forward Groq stream về client
    return new Response(groqRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate AI response" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
