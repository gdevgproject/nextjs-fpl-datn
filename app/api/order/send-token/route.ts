import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { sendOrderEmail } from "@/lib/utils/send-mail";

export async function POST(req: NextRequest) {
  try {
    // Nhận token thay vì accessToken cho đồng bộ với client
    const { email, token, orderId } = await req.json();
    const accessToken = token || undefined;
    if (!email || (!accessToken && !orderId)) {
      return NextResponse.json(
        { error: "Missing email hoặc mã tra cứu đơn hàng" },
        { status: 400 }
      );
    }
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // Ưu tiên tìm theo accessToken (token guest), nếu không có thì theo orderId
    let query = supabase.from("orders").select("id, access_token, guest_email");
    if (accessToken) {
      query = query.eq("access_token", accessToken);
    } else if (orderId) {
      query = query.eq("id", orderId);
    }
    const { data: order } = await query.single();
    if (!order?.access_token) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng phù hợp" },
        { status: 404 }
      );
    }
    // Nếu đơn chưa có email, cập nhật guest_email
    if (!order.guest_email) {
      await supabase
        .from("orders")
        .update({ guest_email: email })
        .eq("id", order.id);
    }
    // Gửi mail access_token
    await sendOrderEmail({
      to: email,
      subject: "Mã tra cứu đơn hàng của bạn",
      html: `<p>Mã tra cứu đơn hàng của bạn là: <b>${order.access_token}</b></p>`,
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Internal error" },
      { status: 500 }
    );
  }
}
