import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PaymentMethod } from "../types";

export function usePaymentMethods() {
  const { data = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["payment_methods"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("is_active", true)
        .order("id");
      if (error) throw error;
      return data as PaymentMethod[];
    },
    staleTime: 1000 * 60 * 60, // 1 giờ
    cacheTime: 1000 * 60 * 60, // 1 giờ
    refetchOnWindowFocus: false,
  });
  return { paymentMethods: data, isLoading };
}
