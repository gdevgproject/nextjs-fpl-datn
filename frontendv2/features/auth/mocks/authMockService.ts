import type { AuthService, User, AuthResponse } from "../types/authTypes"

// Mock user data
const mockUsers = [
  {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  },
]

export class AuthMockService implements AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = mockUsers.find((u) => u.email === email)

    if (!user || user.password !== password) {
      throw new Error("Invalid email or password")
    }

    const { password: _, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token: "mock-jwt-token",
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check if user already exists
    if (mockUsers.some((u) => u.email === email)) {
      throw new Error("User already exists")
    }

    const newUser = {
      id: `${mockUsers.length + 1}`,
      name,
      email,
      password,
    }

    mockUsers.push(newUser)

    const { password: _, ...userWithoutPassword } = newUser

    return {
      user: userWithoutPassword,
      token: "mock-jwt-token",
    }
  }

  async logout(): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In a mock implementation, we don't need to do anything
    return
  }

  async getProfile(): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Return the first mock user (assuming they're logged in)
    const { password: _, ...userWithoutPassword } = mockUsers[0]
    return userWithoutPassword
  }
}

// Export a singleton instance
export const authMockService = new AuthMockService()

