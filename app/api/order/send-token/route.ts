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
    let query = supabase
      .from("orders")
      .select("id, access_token, guest_email, user_id, payment_status");
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
    // Check trạng thái đơn hàng trước
    if (order.payment_status !== "Paid" && order.payment_status !== "Pending") {
      return NextResponse.json(
        {
          error:
            "Đơn hàng chưa thanh toán hoặc đã bị huỷ. Chỉ gửi mail khi đơn hàng đang chờ thanh toán hoặc đã thanh toán thành công.",
        },
        { status: 400 }
      );
    }
    // Sau đó mới check email
    let finalEmail = email;
    if (order.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("id", order.user_id)
        .single();
      const { data: user } = await supabase.auth.admin.getUserById(
        order.user_id
      );
      finalEmail = user?.user?.email || profile?.email || email;
    } else {
      // Nếu là guest, lấy guest_email nếu đã có
      if (!order.guest_email && email) {
        await supabase
          .from("orders")
          .update({ guest_email: email })
          .eq("id", order.id);
      } else if (order.guest_email) {
        finalEmail = order.guest_email;
      }
    }
    if (!finalEmail) {
      return NextResponse.json(
        { error: "Không có email để gửi thông tin đơn hàng." },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Gửi mail xác nhận đơn hàng với nội dung mới
    const orderLink = `${siteUrl}/tra-cuu-don-hang?token=${order.access_token}`;
    let htmlContent = `<p><b>Thông tin đơn hàng của bạn:</b></p>`;
    if (order.id) {
      htmlContent += `<p>Mã đơn hàng: <b>${order.id}</b></p>`;
    }
    htmlContent += `<p>Mã tra cứu đơn hàng: <b>${order.access_token}</b></p>`;
    htmlContent += `<p>Bạn có thể tra cứu đơn hàng tại: <a href='${orderLink}'>${orderLink}</a></p>`;

    await sendOrderEmail({
      to: finalEmail,
      subject: "Thông tin đơn hàng của bạn",
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Internal error" },
      { status: 500 }
    );
  }
}
