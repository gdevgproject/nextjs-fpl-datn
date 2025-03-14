import axios from "axios"
import type { AuthService, User, AuthResponse } from "../types/authTypes"

export class AuthRealService implements AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post("/api/auth/login", { email, password })
    return response.data
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await axios.post("/api/auth/register", { email, password, name })
    return response.data
  }

  async logout(): Promise<void> {
    await axios.post("/api/auth/logout")
    return
  }

  async getProfile(): Promise<User> {
    const response = await axios.get("/api/users/profile")
    return response.data
  }
}

// Export a singleton instance
export const authRealService = new AuthRealService()

