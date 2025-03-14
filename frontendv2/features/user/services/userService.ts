import axios from "axios"
import type { UserService, User, UpdateProfileRequest } from "../types/userTypes"

export class UserRealService implements UserService {
  async getProfile(): Promise<User> {
    const response = await axios.get("/api/users/profile")
    return response.data
  }

  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    const response = await axios.put("/api/users/profile", profileData)
    return response.data
  }
}

// Export a singleton instance
export const userRealService = new UserRealService()

