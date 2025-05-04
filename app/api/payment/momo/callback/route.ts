import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import crypto from "crypto";

// MoMo config (should move to env in production)
const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";
const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
const secretkey =
  process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";

function buildRawSignature(data: any) {
  return (
    `accessKey=${accessKey}` +
    `&amount=${data.amount}` +
    `&extraData=${data.extraData}` +
    `&message=${data.message || ""}` +
    `&orderId=${data.orderId}` +
    `&orderInfo=${data.orderInfo}` +
    `&orderType=${data.orderType || ""}` +
    `&partnerCode=${data.partnerCode}` +
    `&payType=${data.payType || ""}` +
    `&requestId=${data.requestId}` +
    `&responseTime=${data.responseTime || ""}` +
    `&resultCode=${data.resultCode}` +
    `&transId=${data.transId}`
  );
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Lấy orderId thực từ extraData (phải là số, id thực trong bảng orders)
    const realOrderId = Number(data.extraData);
    if (!realOrderId || isNaN(realOrderId)) {
      return NextResponse.json(
        { error: "Invalid order id in extraData" },
        { status: 400 }
      );
    }
    // Khởi tạo supabase client
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // Kiểm tra đơn hàng có tồn tại không
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id")
      .eq("id", realOrderId)
      .single();
    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    // Validate signature
    const rawSignature = buildRawSignature(data);
    const signature = crypto
      .createHmac("sha256", secretkey)
      .update(rawSignature)
      .digest("hex");
    if (signature !== data.signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    // Only process successful payment
    if (data.resultCode !== 0) {
      // Nếu thanh toán thất bại, cập nhật trạng thái thanh toán
      await supabase
        .from("orders")
        .update({
          payment_status: "Failed",
        })
        .eq("id", realOrderId);
      return NextResponse.json({ error: "Payment failed" }, { status: 400 });
    }
    // Insert payment record
    await supabase.from("payments").insert({
      order_id: realOrderId,
      amount: data.amount,
      payment_method_id: 2, // 2 = MoMo (giả định)
      status: "SUCCESS",
      momo_trans_id: data.transId,
      momo_response: data,
    });
    // Update order status và trạng thái thanh toán
    await supabase
      .from("orders")
      .update({
        order_status_id: 1, //
        payment_status: "Paid",
      })
      .eq("id", realOrderId);

    // Gửi email xác nhận đơn hàng sau khi thanh toán thành công qua Momo
    try {
      // Lấy thông tin đơn hàng để lấy email khách hàng
      const { data: orderInfo } = await supabase
        .from("orders")
        .select(
          "id, user_id, guest_email, recipient_name, recipient_phone, province_city, district, ward, street_address, access_token"
        )
        .eq("id", realOrderId)
        .single();
      let customerEmail = orderInfo?.guest_email;
      // Nếu là user đăng nhập, lấy email từ auth.users
      if (!customerEmail && orderInfo?.user_id) {
        const { data: user } = await supabase.auth.admin.getUserById(
          orderInfo.user_id
        );
        customerEmail = user?.user?.email;
      }
      if (customerEmail) {
        // Chuẩn bị nội dung mail
        let subject = `Xác nhận đơn hàng #${realOrderId}`;
        let html = `<p>Cảm ơn bạn đã thanh toán thành công đơn hàng tại shop!</p>`;
        html += `<p>Mã đơn hàng: <b>${realOrderId}</b></p>`;
        if (orderInfo?.access_token) {
          const orderLink = `http://localhost:3000/tra-cuu-don-hang?token=${orderInfo.access_token}`;
          html += `<p>Mã tra cứu đơn hàng: <b>${orderInfo.access_token}</b></p>`;
          html += `<p>Bạn có thể tra cứu đơn hàng tại: <a href='${orderLink}'>${orderLink}</a></p>`;
        }
        // Import động để tránh lỗi khi build edge
        const { sendOrderEmail } = await import("@/lib/utils/send-mail");
        await sendOrderEmail({ to: customerEmail, subject, html });
      }
    } catch (e) {
      // Không throw lỗi gửi mail, chỉ log
      console.error("Gửi email xác nhận đơn hàng (Momo) thất bại:", e);
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Internal error" },
      { status: 500 }
    );
  }
}
