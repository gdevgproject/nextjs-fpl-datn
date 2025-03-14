import type { UserService, User, UpdateProfileRequest } from "../types/userTypes"

// Mock user data
let mockUser: User = {
  id: "user-1",
  name: "Nguyễn Văn A",
  email: "user@example.com",
  phone: "0987654321",
  avatar: "/placeholder.svg",
  address: {
    street: "123 Đường ABC",
    city: "Hà Nội",
    postalCode: "100000",
    country: "Việt Nam",
  },
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
}

export class UserMockService implements UserService {
  async getProfile(): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return { ...mockUser }
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Update user data
    mockUser = {
      ...mockUser,
      ...profileData,
      address: profileData.address ? { ...mockUser.address, ...profileData.address } : mockUser.address,
      updatedAt: new Date().toISOString(),
    }

    return { ...mockUser }
  }
}

// Export a singleton instance
export const userMockService = new UserMockService()

