import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAvatarUrl, deleteAvatar } from "../actions";
import { uploadAvatarClient } from "./uploadAvatarClient";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

export function useAvatarMutation(userId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useSonnerToast();

  // Upload avatar (client upload, then update DB)
  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error("Thiếu userId");
      // Upload file lên storage client-side
      const publicUrl = await uploadAvatarClient(userId, file);
      // Gọi server action để update avatar_url vào DB
      const result = await updateAvatarUrl(userId, publicUrl);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast("Cập nhật thành công", {
        description: "Ảnh đại diện của bạn đã được cập nhật",
      });
    },
    onError: (error: any) => {
      toast("Cập nhật thất bại", {
        description: error.message || "Đã xảy ra lỗi khi cập nhật ảnh đại diện",
      });
    },
  });

  // Delete avatar
  const remove = useMutation({
    mutationFn: async (avatarUrl: string) => {
      if (!userId || !avatarUrl)
        throw new Error("Thiếu thông tin user hoặc avatar");
      const result = await deleteAvatar(userId, avatarUrl);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast("Đã xóa ảnh đại diện", {
        description: "Ảnh đại diện đã được xóa thành công",
      });
    },
    onError: (error: any) => {
      toast("Xóa ảnh đại diện thất bại", {
        description: error.message || "Đã xảy ra lỗi khi xóa ảnh đại diện",
      });
    },
  });

  return { upload, remove };
}
