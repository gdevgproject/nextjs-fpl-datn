import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface UpdateUserParams {
  id: string;
  display_name: string;
  phone_number?: string;
  role: string;
  gender?: string;
  birth_date?: string;
  avatar_url?: string | null;
  password?: string;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (params: UpdateUserParams) => {
      // Update user metadata and role
      const updateData: any = {
        app_metadata: {
          role: params.role,
        },
        user_metadata: {
          display_name: params.display_name,
          phone_number: params.phone_number,
        },
      };

      // Only include password if it's provided
      if (params.password) {
        updateData.password = params.password;
      }

      // Update the user in Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.updateUserById(params.id, updateData);

      if (authError) {
        throw new Error(authError.message);
      }

      // Update the profile with additional information
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: params.display_name,
          phone_number: params.phone_number,
          gender: params.gender,
          birth_date: params.birth_date,
          avatar_url: params.avatar_url,
        })
        .eq("id", params.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      return authData.user;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific user query
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
      // Invalidate users list query
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
