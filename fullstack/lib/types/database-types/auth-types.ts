// Types liên quan đến authentication
export interface AuthUser {
  id: string
  email: string
  role: "admin" | "staff" | "authenticated"
  email_confirmed_at: string | null
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface AuthResponse {
  user: AuthUser | null
  session: AuthSession | null
}

export interface AuthError {
  message: string
  status: number
}

