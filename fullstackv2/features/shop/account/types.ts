export interface ProfileData {
  id: string
  display_name: string | null
  phone_number: string | null
  gender: string | null
  birth_date: string | null
  avatar_url: string | null
  default_address_id: number | null
  created_at: string
  updated_at: string
}

export interface UpdateProfileData {
  display_name?: string
  phone_number?: string | null
  gender?: string | null
  birth_date?: Date | null
  avatar_url?: string | null
}
