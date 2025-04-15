"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Address } from "./types";
import { updateProfileInfo, setDefaultAddress } from "./actions";
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config";

// Lấy danh sách địa chỉ của người dùng
export function useUserAddresses(userId: string | undefined) {
  const supabase = getSupabaseBrowserClient();
  return useQuery({
    queryKey: ["addresses", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Unauthorized");
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Address[];
    },
    enabled: !!userId,
    staleTime: QUERY_STALE_TIME.USER,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });
}

export function useSetDefaultAddress(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (addressId: number) => {
      if (!userId) throw new Error("Unauthorized");
      const result = await setDefaultAddress(addressId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async (addressId) => {
      await queryClient.cancelQueries({ queryKey: ["addresses", userId] });
      const previousAddresses = queryClient.getQueryData<Address[]>([
        "addresses",
        userId,
      ]);
      if (previousAddresses) {
        queryClient.setQueryData<Address[]>(["addresses", userId], (old) => {
          if (!old) return [];
          return old.map((address) => ({
            ...address,
            is_default: address.id === addressId,
          }));
        });
      }
      return { previousAddresses };
    },
    onError: (error, variables, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(
          ["addresses", userId],
          context.previousAddresses
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}

export function useAddAddress(userId: string | undefined) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();
  return useMutation({
    mutationFn: async (
      address: Omit<Address, "id" | "created_at" | "updated_at" | "user_id">
    ) => {
      if (!userId) throw new Error("Unauthorized");
      const { data: existingAddresses, error: fetchError } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", userId)
        .limit(1);
      if (fetchError) throw fetchError;
      const isFirstAddress = existingAddresses.length === 0;
      const shouldBeDefault = isFirstAddress || address.is_default;
      if (shouldBeDefault) {
        const { error: resetError } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", userId);
        if (resetError) throw resetError;
      }
      const { data, error } = await supabase
        .from("addresses")
        .insert({ ...address, user_id: userId, is_default: shouldBeDefault })
        .select()
        .single();
      if (error) throw error;
      if (shouldBeDefault) {
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ default_address_id: data.id })
          .eq("id", userId);
        if (updateProfileError) throw updateProfileError;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}

export function useUpdateAddress(userId: string | undefined) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...address
    }: Partial<Address> & { id: number }) => {
      if (!userId) throw new Error("Unauthorized");
      if (address.is_default) {
        const { error: resetError } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", userId);
        if (resetError) throw resetError;
      }
      const { data, error } = await supabase
        .from("addresses")
        .update(address)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      if (address.is_default) {
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ default_address_id: id })
          .eq("id", userId);
        if (updateProfileError) throw updateProfileError;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}

export function useDeleteAddress(userId: string | undefined) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();
  return useMutation({
    mutationFn: async (id: number) => {
      if (!userId) throw new Error("Unauthorized");
      const { data: addressData, error: fetchError } = await supabase
        .from("addresses")
        .select("is_default")
        .eq("id", id)
        .eq("user_id", userId)
        .single();
      if (fetchError) throw fetchError;
      const { count, error: countError } = await supabase
        .from("addresses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      if (countError) throw countError;
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
      if (addressData.is_default && count > 1) {
        const { data: remainingAddress, error: remainingError } = await supabase
          .from("addresses")
          .select("id")
          .eq("user_id", userId)
          .neq("id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (remainingError) throw remainingError;
        const { error: updateAddressError } = await supabase
          .from("addresses")
          .update({ is_default: true })
          .eq("id", remainingAddress.id)
          .eq("user_id", userId);
        if (updateAddressError) throw updateAddressError;
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ default_address_id: remainingAddress.id })
          .eq("id", userId);
        if (updateProfileError) throw updateProfileError;
      } else if (count <= 1) {
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ default_address_id: null })
          .eq("id", userId);
        if (updateProfileError) throw updateProfileError;
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}

export function useUpdateUserProfile(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData: any) => {
      if (!userId) throw new Error("Unauthorized");
      const result = await updateProfileInfo(userId, profileData);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}
