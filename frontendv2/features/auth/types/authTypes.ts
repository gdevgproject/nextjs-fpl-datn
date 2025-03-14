// Types for auth feature
export interface User {
  id: string
  name: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface AuthService {
  login(email: string, password: string): Promise<AuthResponse>
  register(email: string, password: string, name: string): Promise<AuthResponse>
  logout(): Promise<void>
  getProfile(): Promise<User>
}

