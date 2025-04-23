import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey)
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    }
  );
  // llama3-8b-8192
  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { error: data.error?.message || response.statusText },
      { status: response.status }
    );
  }
  return NextResponse.json(data);
}
