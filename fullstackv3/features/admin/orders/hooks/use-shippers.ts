"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"
import { createClient } from "@/shared/supabase/client"

const supabase = createClient()

export function useShippers() {
  return useClientFetch(
    ["shippers", "list"],
    "auth.users",
    {
      columns: "id, email, raw_user_meta_data",
      filters: (query) => {
        // This is a workaround since we can't directly filter on raw_app_meta_data->>'role'
        // We'll filter the results in the transform function
        return query
      },
      // We need to transform the data to filter out non-shippers
      // and format the data for easier consumption
    },
    {
      select: (data) => {
        if (!data.data) return { data: [], count: 0 }

        // Filter to only include users with shipper role
        const shippers = Array.isArray(data.data)
          ? data.data.filter((user) => user.raw_app_meta_data && user.raw_app_meta_data.role === "shipper")
          : []

        // Transform the data to a more usable format
        const formattedShippers = shippers.map((shipper) => ({
          id: shipper.id,
          email: shipper.email,
          name: shipper.raw_user_meta_data?.display_name || shipper.email,
        }))

        return {
          data: formattedShippers,
          count: formattedShippers.length,
        }
      },
    },
  )
}
