"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useShippers() {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["shippers", "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("auth.users")
        .select("id, email, raw_user_meta_data, raw_app_meta_data");

      if (error) {
        console.error("Error fetching shippers:", error);
        throw error;
      }

      // Filter to only include users with shipper role
      const shippers = Array.isArray(data)
        ? data.filter(
            (user) =>
              user.raw_app_meta_data &&
              user.raw_app_meta_data.role === "shipper"
          )
        : [];

      // Transform the data to a more usable format
      const formattedShippers = shippers.map((shipper) => ({
        id: shipper.id,
        email: shipper.email,
        name: shipper.raw_user_meta_data?.display_name || shipper.email,
      }));

      return {
        data: formattedShippers,
        count: formattedShippers.length,
      };
    },
  });
}
