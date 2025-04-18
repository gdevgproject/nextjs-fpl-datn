import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAvatar } from "../actions";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

export function useDeleteAvatarMutation(userId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useSonnerToast();
  return useMutation({
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
}
