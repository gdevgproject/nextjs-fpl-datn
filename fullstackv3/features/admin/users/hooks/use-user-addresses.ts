import { useClientFetch } from "@/shared/hooks/use-client-fetch"

export function useUserAddresses(userId?: string) {
  return useClientFetch(
    ["user-addresses", userId],
    "addresses",
    {
      filters: (query) => {
        return query.eq("user_id", userId)
      },
      sort: [
        { column: "is_default", ascending: false },
        { column: "created_at", ascending: false },
      ],
    },
    {
      enabled: !!userId,
    },
  )
}
