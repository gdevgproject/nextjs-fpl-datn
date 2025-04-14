import { useClientFetch } from "@/shared/hooks/use-client-fetch"

interface UseUsersParams {
  search?: string
  roleFilter?: string
  page?: number
  pageSize?: number
}

export function useUsers({ search, roleFilter, page = 1, pageSize = 10 }: UseUsersParams = {}) {
  return useClientFetch(
    ["users", search, roleFilter, page, pageSize],
    "profiles",
    {
      columns: "*, auth.users!profiles.id(email, raw_app_meta_data, created_at, updated_at)",
      filters: (query) => {
        let filteredQuery = query

        // Apply search filter if provided
        if (search) {
          filteredQuery = filteredQuery.or(
            `display_name.ilike.%${search}%,phone_number.ilike.%${search}%,auth.users.email.ilike.%${search}%`,
          )
        }

        // Apply role filter if provided
        if (roleFilter) {
          filteredQuery = filteredQuery.filter("auth.users.raw_app_meta_data->role", "eq", roleFilter)
        }

        return filteredQuery
      },
      pagination: {
        page,
        pageSize,
      },
      sort: [{ column: "created_at", ascending: false }],
      count: "exact",
    },
    {
      select: (data) => {
        // Transform the data to include role from raw_app_meta_data
        const transformedData = {
          ...data,
          data: data.data
            ? Array.isArray(data.data)
              ? data.data.map((user) => ({
                  ...user,
                  email: user["auth.users"]?.email,
                  role: user["auth.users"]?.raw_app_meta_data?.role || "authenticated",
                  created_at: user["auth.users"]?.created_at || user.created_at,
                  updated_at: user["auth.users"]?.updated_at || user.updated_at,
                }))
              : {
                  ...data.data,
                  email: data.data["auth.users"]?.email,
                  role: data.data["auth.users"]?.raw_app_meta_data?.role || "authenticated",
                  created_at: data.data["auth.users"]?.created_at || data.data.created_at,
                  updated_at: data.data["auth.users"]?.updated_at || data.data.updated_at,
                }
            : null,
        }
        return transformedData
      },
    },
  )
}
