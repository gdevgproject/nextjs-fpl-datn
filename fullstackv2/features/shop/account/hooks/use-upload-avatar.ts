"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/shared/supabase/client";
import { useAuth } from "@/features/auth/context/auth-context";
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast";
import {
  useStorageUpload,
  useStorageDelete,
} from "@/shared/hooks/use-client-storage";
import { useClientMutate } from "@/shared/hooks/use-client-mutation";

const supabase = createClient();

export function useUploadAvatar() {
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const toast = useSonnerToast();
  const { user, refreshUser } = useAuth();

  // Use the storage upload hook for uploading files
  const uploadMutation = useStorageUpload("avatars", {
    invalidateQueryKeys: [["profile", user?.id], ["user"]],
    mutationOptions: {
      onError: (error) => {
        if (error.name !== "AbortError") {
          console.error("Error uploading avatar:", error);
          toast.error("Tải lên ảnh đại diện thất bại");
        }
      },
    },
  });

  // Use the storage delete hook for deleting old avatars
  const deleteMutation = useStorageDelete("avatars");

  // Use the client mutation hook for updating the profile with the new avatar URL
  const profileMutation = useClientMutate<"profiles", "update">(
    "profiles",
    "update",
    {
      primaryKey: "id",
      invalidateQueries: [["profile", user?.id], ["user"]],
    }
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const controller = new AbortController();
      setAbortController(controller);

      try {
        // Get file extension
        const fileExt = file.name.split(".").pop();
        // Create a unique file name
        const fileName = `${uuidv4()}.${fileExt}`;
        // Create the file path following the convention in db.txt
        const filePath = `${user.id}/${fileName}`;

        // First, check if user already has an avatar
        const { data: profileData } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        // Upload the new avatar using the storage upload hook
        const result = await uploadMutation.mutateAsync({
          file,
          path: filePath,
          fileOptions: {
            cacheControl: "3600",
            upsert: false,
            signal: controller.signal, // Pass the AbortController signal
          },
        });

        if (!result.publicUrl) {
          throw new Error("Failed to get public URL");
        }

        // Update the profile with the new avatar URL
        await profileMutation.mutateAsync({
          id: user.id,
          avatar_url: result.publicUrl,
        });

        // Update user metadata with the new avatar URL
        await supabase.auth.updateUser({
          data: { avatar_url: result.publicUrl },
        });

        // If user had a previous avatar, delete it to save storage
        if (profileData?.avatar_url) {
          // Extract the file path from the URL
          const oldAvatarPath = profileData.avatar_url.split("/avatars/")[1];
          if (oldAvatarPath) {
            // Delete the old avatar (don't wait for this to complete)
            deleteMutation.mutate(oldAvatarPath);
          }
        }

        // Refresh user data to update the header
        await refreshUser();

        toast.success("Ảnh đại diện đã được cập nhật");
        return result.publicUrl;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          toast.info("Đã hủy tải lên ảnh đại diện");
        } else {
          throw error;
        }
      } finally {
        setAbortController(null);
      }
    },
    [user, uploadMutation, profileMutation, deleteMutation, refreshUser, toast]
  );

  const cancelUpload = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
  }, [abortController]);

  return {
    uploadAvatar,
    isUploading: uploadMutation.isPending,
    cancelUpload,
  };
}
