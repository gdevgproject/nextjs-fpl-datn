import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import type { Database } from "@/lib/types/database.types"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type") || "signup"

  if (code) {
    const cookieStore = request.cookies
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    try {
      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        // Redirect to login with error
        const redirectUrl = new URL("/dang-nhap", requestUrl.origin)
        redirectUrl.searchParams.set("auth_error", encodeURIComponent(error.message))
        return NextResponse.redirect(redirectUrl)
      }

      // Redirect to login page with success message
      const redirectUrl = new URL("/dang-nhap", requestUrl.origin)

      // Add auth_action param based on the type of verification
      if (type === "signup") {
        redirectUrl.searchParams.set("auth_action", "email_confirmed")
      } else if (type === "recovery") {
        redirectUrl.searchParams.set("auth_action", "password_reset")
      }

      return NextResponse.redirect(redirectUrl)
    } catch (err) {
      console.error("Error processing callback:", err)
    }
  }

  // If there's no code or any other error, redirect to login
  return NextResponse.redirect(new URL("/dang-nhap", requestUrl.origin))
}

