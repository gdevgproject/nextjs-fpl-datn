import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// MoMo config (should move to env in production)
const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";
const accessKey = process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85";
const secretkey =
  process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const momoEndpoint = "https://test-payment.momo.vn/v2/gateway/api/create";

// Helper: get order info from Supabase
async function getOrderInfo(orderId: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from("orders")
    .select("id, total_amount, user_id")
    .eq("id", Number(orderId))
    .single();
  if (error || !data) throw new Error("Order not found");
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();
    if (!orderId)
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    const order = await getOrderInfo(orderId);
    const amount = order.total_amount;
    if (!amount || amount <= 0)
      return NextResponse.json(
        { error: "Invalid order amount" },
        { status: 400 }
      );

    const requestId = partnerCode + Date.now();
    const momoOrderId = requestId;
    const orderInfo = `Thanh toán đơn hàng #${orderId}`;
    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/xac-nhan-don-hang?orderId=${orderId}`;
    const ipnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/momo/callback`;
    const requestType = "captureWallet";
    const extraData = order.id.toString(); // orderId thực của hệ thống bạn

    // Build raw signature
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${momoOrderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;
    const signature = crypto
      .createHmac("sha256", secretkey)
      .update(rawSignature)
      .digest("hex");

    // Build request body
    const body = {
      partnerCode,
      accessKey,
      requestId,
      amount: amount.toString(),
      orderId: momoOrderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    // Call MoMo API
    const momoRes = await fetch(momoEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const momoData = await momoRes.json();
    if (momoData.resultCode !== 0) {
      return NextResponse.json(
        { error: momoData.message || "MoMo error" },
        { status: 400 }
      );
    }
    return NextResponse.json({ payUrl: momoData.payUrl });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Internal error" },
      { status: 500 }
    );
  }
}
