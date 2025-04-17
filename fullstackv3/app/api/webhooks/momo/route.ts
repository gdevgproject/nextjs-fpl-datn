import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/serviceRoleClient";

// Webhook nhận callback từ Momo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Lấy thông tin cấu hình Momo từ biến môi trường
    const secretKey = process.env.MOMO_SECRET_KEY!;
    // Xác thực chữ ký
    const {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = body;
    // Tạo rawSignature theo tài liệu Momo
    const rawSignature =
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
      `&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}` +
      `&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}` +
      `&resultCode=${resultCode}&transId=${transId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");
    if (signature !== expectedSignature) {
      return NextResponse.json(
        { resultCode: 1, message: "Invalid signature" },
        { status: 400 }
      );
    }
    // Chỉ xử lý khi thanh toán thành công
    if (resultCode === 0) {
      const supabase = createServiceRoleClient();
      // Cập nhật bảng payments
      await supabase
        .from("payments")
        .update({
          status: "Completed",
          transaction_id: transId,
          payment_details: body,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId);
      // Cập nhật bảng orders
      await supabase
        .from("orders")
        .update({
          payment_status: "Paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);
    }
    return NextResponse.json({ resultCode: 0, message: "Success" });
  } catch (e) {
    return NextResponse.json(
      { resultCode: 2, message: "Webhook error" },
      { status: 500 }
    );
  }
}
