import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const nextPath = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = await getSupabaseServerClient();

    try {
      // Exchange the code for a session
      const { error: sessionError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) {
        return NextResponse.redirect(
          new URL(
            `/dang-nhap?error=${encodeURIComponent(sessionError.message)}`,
            requestUrl.origin
          )
        );
      }

      // Determine redirect after successful session exchange
      let redirectUrl = "/";
      if (type === "signup") {
        redirectUrl = "/dang-nhap?auth_action=email_confirmed";
      } else if (type === "recovery") {
        redirectUrl = `/dat-lai-mat-khau?code=${encodeURIComponent(code)}`;
      } else {
        // Magic link or default
        redirectUrl = nextPath
          ? `${nextPath}?auth_action=signed_in`
          : "/?auth_action=signed_in";
      }

      return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
    } catch {
      return NextResponse.redirect(
        new URL(`/dang-nhap?error=auth_error`, requestUrl.origin)
      );
    }
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
