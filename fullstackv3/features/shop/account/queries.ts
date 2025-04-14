"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/features/auth/auth-context";
import type { Address } from "./types";
import { updateProfileInfo, setDefaultAddress } from "./actions";
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config";

// Lấy danh sách địa chỉ của người dùng
export function useUserAddresses() {
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Unauthorized");

      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data as Address[];
    },
    enabled: !!user,
    staleTime: QUERY_STALE_TIME.USER,
    // Thêm các options để tối ưu hiệu suất
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
  });
}

// Hook mới để xử lý việc đặt địa chỉ mặc định
export function useSetDefaultAddress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressId: number) => {
      if (!user) throw new Error("Unauthorized");

      const result = await setDefaultAddress(addressId);

      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    },
    // Cập nhật cache ngay lập tức để UI phản hồi nhanh chóng
    onMutate: async (addressId) => {
      // Hủy các queries đang chạy để tránh ghi đè
      await queryClient.cancelQueries({ queryKey: ["addresses", user?.id] });

      // Lưu trữ state trước đó để có thể rollback nếu có lỗi
      const previousAddresses = queryClient.getQueryData<Address[]>([
        "addresses",
        user?.id,
      ]);

      // Cập nhật cache ngay lập tức
      if (previousAddresses) {
        queryClient.setQueryData<Address[]>(["addresses", user?.id], (old) => {
          if (!old) return [];

          // Cập nhật trạng thái is_default cho tất cả địa chỉ
          return old.map((address) => ({
            ...address,
            is_default: address.id === addressId,
          }));
        });
      }

      // Trả về context để sử dụng trong onError
      return { previousAddresses };
    },
    // Nếu có lỗi, rollback lại state trước đó
    onError: (error, variables, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData(
          ["addresses", user?.id],
          context.previousAddresses
        );
      }
    },
    // Sau khi mutation thành công, invalidate queries để fetch lại dữ liệu mới
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}

// Thêm địa chỉ mới
export function useAddAddress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (
      address: Omit<Address, "id" | "created_at" | "updated_at" | "user_id">
    ) => {
      if (!user) throw new Error("Unauthorized");

      // Kiểm tra xem người dùng đã có địa chỉ nào chưa
      const { data: existingAddresses, error: fetchError } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (fetchError) throw fetchError;

      // Nếu chưa có địa chỉ nào, tự động đặt địa chỉ đầu tiên làm mặc định
      const isFirstAddress = existingAddresses.length === 0;
      const shouldBeDefault = isFirstAddress || address.is_default;

      // Nếu địa chỉ được đánh dấu là mặc định, cần reset các địa chỉ khác
      if (shouldBeDefault) {
        // Reset tất cả địa chỉ khác
        const { error: resetError } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);

        if (resetError) throw resetError;
      }

      // Thêm địa chỉ mới với trạng thái mặc định được cập nhật
      const { data, error } = await supabase
        .from("addresses")
        .insert({ ...address, user_id: user.id, is_default: shouldBeDefault })
        .select()
        .single();

      if (error) throw error;

      // Nếu là địa chỉ mặc định, cập nhật profiles
      if (shouldBeDefault) {
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ default_address_id: data.id })
          .eq("id", user.id);

        if (updateProfileError) throw updateProfileError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}

// Cập nhật địa chỉ
export function useUpdateAddress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...address
    }: Partial<Address> & { id: number }) => {
      if (!user) throw new Error("Unauthorized");

      // Nếu địa chỉ được đánh dấu là mặc định, cần reset các địa chỉ khác
      if (address.is_default) {
        // Reset tất cả địa chỉ khác
        const { error: resetError } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);

        if (resetError) throw resetError;
      }

      // Cập nhật địa chỉ
      const { data, error } = await supabase
        .from("addresses")
        .update(address)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Nếu là địa chỉ mặc định, cập nhật profiles
      if (address.is_default) {
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ default_address_id: id })
          .eq("id", user.id);

        if (updateProfileError) throw updateProfileError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}

// Xóa địa chỉ
export function useDeleteAddress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!user) throw new Error("Unauthorized");

      // Kiểm tra xem địa chỉ có phải là mặc định không và lấy tổng số địa chỉ
      const { data: addressData, error: fetchError } = await supabase
        .from("addresses")
        .select("is_default")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw fetchError;

      // Lấy tổng số địa chỉ của người dùng
      const { count, error: countError } = await supabase
        .from("addresses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (countError) throw countError;

      // Xóa địa chỉ
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Nếu là địa chỉ mặc định và không phải địa chỉ cuối cùng, cần đặt một địa chỉ khác làm mặc định
      if (addressData.is_default && count > 1) {
        // Lấy địa chỉ đầu tiên còn lại để đặt làm mặc định
        const { data: remainingAddress, error: remainingError } = await supabase
          .from("addresses")
          .select("id")
          .eq("user_id", user.id)
          .neq("id", id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (remainingError) throw remainingError;

        // Đặt địa chỉ còn lại làm mặc định
        const { error: updateAddressError } = await supabase
          .from("addresses")
          .update({ is_default: true })
          .eq("id", remainingAddress.id)
          .eq("user_id", user.id);

        if (updateAddressError) throw updateAddressError;

        // Cập nhật default_address_id trong profiles
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ default_address_id: remainingAddress.id })
          .eq("id", user.id);

        if (updateProfileError) throw updateProfileError;
      } else if (count <= 1) {
        // Nếu đây là địa chỉ cuối cùng, cập nhật default_address_id thành null
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .update({ default_address_id: null })
          .eq("id", user.id);

        if (updateProfileError) throw updateProfileError;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}

// Cập nhật thông tin profile
export function useUpdateUserProfile() {
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: any) => {
      if (!user) throw new Error("Unauthorized");

      // Sử dụng server action mới
      const result = await updateProfileInfo(user.id, profileData);

      if (result.error) throw new Error(result.error);

      return result;
    },
    onSuccess: () => {
      refreshProfile();
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}
