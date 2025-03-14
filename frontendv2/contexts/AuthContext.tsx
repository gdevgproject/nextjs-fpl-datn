"use client"

import type React from "react"

import { createContext, useState, useEffect } from "react"
import { authService } from "@/features/auth/services/authServiceFactory"
import type { User } from "@/features/auth/types/authTypes"

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth-token")
        if (token) {
          // Fetch user profile
          const userProfile = await authService.getProfile()
          setUser(userProfile)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        localStorage.removeItem("auth-token")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authService.login(email, password)
      localStorage.setItem("auth-token", response.token)
      setUser(response.user)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      const response = await authService.register(email, password, name)
      localStorage.setItem("auth-token", response.token)
      setUser(response.user)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      localStorage.removeItem("auth-token")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

