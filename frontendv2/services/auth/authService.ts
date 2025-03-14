import apiClient from "../api/apiClient"

export interface CheckUserExistsParams {
  phone: string
}

export interface GetPhoneOtpParams {
  optionSeller: number
  phone: string
}

export interface LoginParams {
  email: string
  password: string
}

export interface LoginWithOtpParams {
  phone: string
  password: string // OTP code
}

export interface LoginResponse {
  token: string
  infoUser: any // Use the InfoUser type from common.ts
}

class AuthService {
  // Check if user exists
  async checkUserExists(params: CheckUserExistsParams): Promise<boolean> {
    try {
      const response = await apiClient.post("/api/auth/users/check-user-exists", params, false)
      return !!response
    } catch (error) {
      console.error("Error checking user existence:", error)
      return false
    }
  }

  // Get OTP for phone login
  async getPhoneOtp(params: GetPhoneOtpParams): Promise<boolean> {
    try {
      const response = await apiClient.post("/api/auth/users/get-phone-otp", params, false)
      return !!response
    } catch (error) {
      console.error("Error getting phone OTP:", error)
      throw error
    }
  }

  // Login with email/password
  async login(params: LoginParams): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>("/api/auth/users/login", params, false)

      // Store token for future requests
      if (response.token) {
        apiClient.setToken(response.token)
      }

      return response
    } catch (error) {
      console.error("Error during login:", error)
      throw error
    }
  }

  // Login with phone/OTP
  async loginWithOtp(params: LoginWithOtpParams): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/api/auth/users/login",
        {
          email: params.phone, // API uses email field for phone
          password: params.password, // OTP code
        },
        false,
      )

      // Store token for future requests
      if (response.token) {
        apiClient.setToken(response.token)
      }

      return response
    } catch (error) {
      console.error("Error during OTP login:", error)
      throw error
    }
  }

  // Logout
  async logout(): Promise<void> {
    apiClient.clearToken()
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!apiClient.getToken()
  }
}

// Create and export a singleton instance
export const authService = new AuthService()

export default authService

