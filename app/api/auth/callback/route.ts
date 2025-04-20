import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type") || "signup";

  if (code) {
    const cookieStore = request.cookies;
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);

    // Handle redirects based on the authentication type
    if (type === "signup") {
      // Redirect to login with email confirmed param
      return NextResponse.redirect(
        new URL(`/dang-nhap?auth_action=email_confirmed`, requestUrl.origin)
      );
    } else if (type === "recovery") {
      // Redirect to reset password page with code
      return NextResponse.redirect(
        new URL(
          `/dat-lai-mat-khau?code=${encodeURIComponent(code!)}`,
          requestUrl.origin
        )
      );
    } else if (type === "invite") {
      // Redirect to account settings
      return NextResponse.redirect(
        new URL(`/tai-khoan/cai-dat`, requestUrl.origin)
      );
    }

    // Default redirect to the account page
    return NextResponse.redirect(new URL(`/tai-khoan`, requestUrl.origin));
  }

  // If no code, redirect to home
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
