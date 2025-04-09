"use client"

import { useClientFetch } from "@/shared/hooks/use-client-fetch"
import { useAuth } from "@/features/auth/context/auth-context"
import type { ProfileData } from "../types"

export function useProfile() {
  const { user } = useAuth()

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useClientFetch<"profiles", ProfileData>(
    ["profile", user?.id],
    "profiles",
    {
      filters: (query) => query.select("*").eq("id", user?.id),
      single: true,
    },
    {
      enabled: !!user?.id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  )

  return {
    profile,
    isLoading,
    error,
    refetchProfile: refetch,
  }
}
