import axios from "axios"
import { getEnv } from "@/config/env"

const API_URL = getEnv("API_URL")

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  // Add auth token if available (client-side only)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (e.g., 401 Unauthorized)
    if (error.response?.status === 401) {
      // Clear auth token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-token")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default api

