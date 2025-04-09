"use client";

import { useCallback } from "react";
import { useClientMutate } from "@/shared/hooks/use-client-mutation";
import { useAuth } from "@/features/auth/context/auth-context";
import type { UpdateProfileData } from "../types";
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast";
import { createClient } from "@/shared/supabase/client";

const supabase = createClient();

export function useUpdateProfile() {
  const toast = useSonnerToast();
  const { user, refreshUser } = useAuth();

  // Use the client mutation hook for updating the profile
  const mutation = useClientMutate<"profiles", "update">("profiles", "update", {
    primaryKey: "id",
    invalidateQueries: [["profile", user?.id], ["user"]],
    mutationOptions: {
      onSuccess: async () => {
        toast.success("Thông tin tài khoản đã được cập nhật");
      },
      onError: (error) => {
        console.error("Error updating profile:", error);
        toast.error("Cập nhật thông tin thất bại");
      },
    },
  });

  const updateProfile = useCallback(
    async (data: UpdateProfileData) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      try {
        // Format the data for Supabase
        const updateData: Record<string, any> = { ...data };

        // Format date if it exists
        if (data.birth_date) {
          updateData.birth_date = data.birth_date.toISOString().split("T")[0];
        }

        // Update profile in Supabase using the mutation hook
        await mutation.mutateAsync({
          id: user.id,
          ...updateData,
        });

        // Update user metadata if display_name changed
        if (data.display_name) {
          await supabase.auth.updateUser({
            data: { display_name: data.display_name },
          });

          // Refresh user to update the header
          await refreshUser();
        }

        return true;
      } catch (error) {
        throw error;
      }
    },
    [user, mutation, refreshUser]
  );

  return {
    updateProfile,
    isUpdating: mutation.isPending,
  };
}
