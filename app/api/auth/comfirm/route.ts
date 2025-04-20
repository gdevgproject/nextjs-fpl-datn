import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/xac-nhan-email?error=missing_code", url.origin)
    );
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/xac-nhan-email?error=invalid_code&error_description=${encodeURIComponent(
          error.message
        )}`,
        url.origin
      )
    );
  }

  // On successful exchange, redirect based on action type
  const type = url.searchParams.get("type");
  const nextPath = url.searchParams.get("next");
  let redirectUrl: string;
  if (type === "magic") {
    // Magic link login
    redirectUrl = nextPath
      ? `${nextPath}?auth_action=signed_in`
      : "/?auth_action=signed_in";
  } else {
    // Default: sign-up email confirmation
    redirectUrl = "/?auth_action=email_confirmed";
  }
  return NextResponse.redirect(new URL(redirectUrl, url.origin));
}
