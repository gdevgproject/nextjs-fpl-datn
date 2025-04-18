import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadAvatar, deleteAvatar } from "../actions";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

export function useAvatarMutation(userId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useSonnerToast();

  // Upload avatar
  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (!userId) throw new Error("Thiếu userId");
      const result = await uploadAvatar(userId, file);
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
