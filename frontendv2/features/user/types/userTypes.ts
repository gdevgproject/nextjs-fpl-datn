// Types for user feature
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  address?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  name?: string
  phone?: string
  avatar?: string
  address?: {
    street?: string
    city?: string
    postalCode?: string
    country?: string
  }
}

export interface UserService {
  getProfile(): Promise<User>
  updateProfile(profileData: UpdateProfileRequest): Promise<User>
}

