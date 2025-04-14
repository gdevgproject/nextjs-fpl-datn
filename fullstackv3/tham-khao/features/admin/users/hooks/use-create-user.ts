import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/shared/supabase/client"

interface CreateUserParams {
  email: string
  password: string
  display_name: string
  phone_number?: string
  role: string
  gender?: string
  birth_date?: string
  avatar_url?: string | null
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (params: CreateUserParams) => {
      // First, create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: params.email,
        password: params.password,
        email_confirm: true,
        app_metadata: {
          role: params.role,
        },
        user_metadata: {
          display_name: params.display_name,
          phone_number: params.phone_number,
        },
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error("Failed to create user")
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
        .eq("id", authData.user.id)

      if (profileError) {
        throw new Error(profileError.message)
      }

      return authData.user
    },
    onSuccess: () => {
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })
}
