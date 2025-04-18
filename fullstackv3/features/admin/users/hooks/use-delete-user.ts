import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Delete the user from Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        throw new Error(error.message);
      }

      return userId;
    },
    onSuccess: () => {
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
