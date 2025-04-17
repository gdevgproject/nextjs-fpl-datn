import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// DEMO: Tích hợp Momo MTN (API public, không cần biến môi trường)
export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();
    // Thông số test Momo Việt Nam
    const endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
    const partnerCode = "MOMOBKUN20180529";
    const accessKey = "klm05TvNBzhg7h7j";
    const secretKey = "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa";
    const orderInfo = "Thanh toán qua mã QR MoMo";
    const orderId = Date.now().toString();
    const redirectUrl = "http://localhost/3000";
    const ipnUrl = "http://localhost/3000";
    const requestType = "captureWallet";
    const extraData = "";
    const requestId = orderId;
    // Tạo raw signature
    const rawSignature =
      `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");
    // Body gửi lên Momo
    const body = {
      partnerCode,
      accessKey,
      requestId,
      amount: String(amount),
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };
    // Gửi request tới Momo
    const momoRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const momoData = await momoRes.json();
    if (momoData.resultCode !== 0) {
      return NextResponse.json(
        { error: momoData.message || "Tạo thanh toán thất bại" },
        { status: 400 }
      );
    }
    // Trả về link QR cho UI
    return NextResponse.json({
      payUrl: momoData.payUrl,
      qrCodeUrl: momoData.qrCodeUrl,
      deeplink: momoData.deeplink,
      orderId,
      requestId,
    });
  } catch (e) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url!);
    const referenceId = searchParams.get("referenceId");
    if (!referenceId) {
      return new Response(JSON.stringify({ error: "Thiếu referenceId" }), {
        status: 400,
      });
    }
    const apiUrl = `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/${referenceId}`;
    const subscriptionKey = "REPLACE_WITH_YOUR_SUBSCRIPTION_KEY";
    // Lấy access token từ API Momo MTN (bạn cần tự lấy token hợp lệ)
    const accessToken = "REPLACE_WITH_ACCESS_TOKEN";
    const momoRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "X-Target-Environment": "sandbox",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const momoData = await momoRes.json();
    return new Response(JSON.stringify(momoData), { status: momoRes.status });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Lỗi hệ thống demo" }), {
      status: 500,
    });
  }
}
