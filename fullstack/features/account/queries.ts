"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/providers/auth-context"
import type { Address } from "@/lib/types/shared.types"
import { updateProfileInfo } from "./actions"

// Lấy danh sách địa chỉ của người dùng
export function useUserAddresses() {
  const { user } = useAuth()
  const supabase = getSupabaseBrowserClient()

  return useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Unauthorized")

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })

      if (error) throw error

      return data as Address[]
    },
    enabled: !!user,
  })
}

// Thêm địa chỉ mới
export function useAddAddress() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = getSupabaseBrowserClient()

  return useMutation({
    mutationFn: async (address: Omit<Address, "id" | "created_at" | "updated_at">) => {
      if (!user) throw new Error("Unauthorized")

      const { data, error } = await supabase
        .from("addresses")
        .insert({ ...address, user_id: user.id })
        .select()
        .single()

      if (error) throw error

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] })
    },
  })
}

// Cập nhật địa chỉ
export function useUpdateAddress() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = getSupabaseBrowserClient()

  return useMutation({
    mutationFn: async ({ id, ...address }: Partial<Address> & { id: number }) => {
      if (!user) throw new Error("Unauthorized")

      const { data, error } = await supabase
        .from("addresses")
        .update(address)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] })
    },
  })
}

// Xóa địa chỉ
export function useDeleteAddress() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = getSupabaseBrowserClient()

  return useMutation({
    mutationFn: async (id: number) => {
      if (!user) throw new Error("Unauthorized")

      const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error

      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] })
    },
  })
}

// Cập nhật thông tin profile
export function useUpdateUserProfile() {
  const { user, refreshProfile } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profileData: any) => {
      if (!user) throw new Error("Unauthorized")

      // Sử dụng server action mới
      const result = await updateProfileInfo(user.id, profileData)

      if (result.error) throw new Error(result.error)

      return result
    },
    onSuccess: () => {
      refreshProfile()
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] })
    },
  })
}

