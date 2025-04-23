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
      return NextResponse.json({ error: "Payment failed" }, { status: 400 });
    }
    // Update payment and order status in DB
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    // Insert payment record
    await supabase.from("payments").insert({
      order_id: data.orderId,
      amount: data.amount,
      payment_method_id: 2, // 2 = MoMo (giả định)
      status: "SUCCESS",
      momo_trans_id: data.transId,
      momo_response: data,
    });
    // Update order status
    await supabase
      .from("orders")
      .update({
        order_status_id: 4, // 4 = Đã thanh toán (giả định, cần map đúng schema)
      })
      .eq("id", data.orderId);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Internal error" },
      { status: 500 }
    );
  }
}
