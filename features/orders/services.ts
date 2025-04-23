import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";

export async function getOrderById(orderId: string) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from("orders")
    .select("id, total_amount, user_id, order_status_id")
    .eq("id", orderId)
    .single();
  if (error || !data) throw new Error("Order not found");
  return data;
}
