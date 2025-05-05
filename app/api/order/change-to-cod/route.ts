import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
export async function POST(req: NextRequest) {
  try {
    const { orderId, token } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Thiếu orderId" }, { status: 400 });
    }
    const supabase = await createServiceRoleClient();
    // Lấy id phương thức thanh toán COD
    const { data: codMethod } = await supabase
      .from("payment_methods")
      .select("id")
      .eq("name", "COD")
      .single();
    if (!codMethod) {
      return NextResponse.json(
        { error: "Không tìm thấy phương thức COD" },
        { status: 400 }
      );
    }
    // Cập nhật đơn hàng sang COD, reset trạng thái thanh toán về Pending
    const { error } = await supabase
      .from("orders")
      .update({ payment_method_id: codMethod.id, payment_status: "Pending" })
      .eq("id", orderId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Lỗi server" },
      { status: 500 }
    );
  }
}
