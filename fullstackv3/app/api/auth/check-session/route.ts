import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await getSupabaseServerClient()

  // Kiểm tra session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Trả về trạng thái session
  return NextResponse.json({
    hasSession: !!session,
    isPasswordRecovery: session?.user?.aud === "recovery",
  })
}

