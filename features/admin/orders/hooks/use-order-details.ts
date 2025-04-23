"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useOrderDetails(orderId: number | null) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["orders", "details", orderId],
    queryFn: async () => {
      if (!orderId) return { data: null, count: null };

      const { data, error, count } = await supabase
        .from("orders")
        .select(
          `
          id, 
          access_token, 
          user_id, 
          assigned_shipper_id, 
          guest_name, 
          guest_email, 
          guest_phone, 
          recipient_name, 
          recipient_phone, 
          province_city, 
          district, 
          ward, 
          street_address, 
          order_date, 
          delivery_notes, 
          payment_method_id, 
          payment_status, 
          order_status_id, 
          discount_id, 
          subtotal_amount, 
          discount_amount, 
          shipping_fee, 
          total_amount, 
          cancellation_reason, 
          cancelled_by, 
          cancelled_by_user_id, 
          delivery_failure_reason, 
          delivery_failure_timestamp, 
          completed_at, 
          created_at, 
          updated_at,
          order_statuses(id, name),
          payment_methods(id, name),
          profiles(id, display_name, phone_number, avatar_url)
        `
        )
        .eq("id", orderId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching order details:", error);
        throw error;
      }

      return { data, count };
    },
    enabled: !!orderId,
  });
}
