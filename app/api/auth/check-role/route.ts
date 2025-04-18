import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getUserRoleFromMetadata } from "@/lib/utils/auth-utils";

export async function GET() {
  const supabase = await getSupabaseServerClient();

  // Kiểm tra session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json(
      { role: "anon", isAuthenticated: false },
      { status: 200 }
    );
  }

  // Lấy role từ app_metadata
  const role = getUserRoleFromMetadata(session.user);

  return NextResponse.json(
    {
      role,
      isAuthenticated: true,
      userId: session.user.id,
      email: session.user.email,
    },
    { status: 200 }
  );
}
