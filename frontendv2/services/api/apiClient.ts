import axios, { type AxiosInstance } from "axios"

// Sử dụng giá trị mặc định an toàn hoặc để trống
const API_URL = process.env.NEXT_PUBLIC_API_URL || ""
const DEFAULT_TIMEOUT = Number.parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000") // 30 giây là giá trị kỹ thuật thông thường
const CLOUDFRONT_URL = process.env.NEXT_PUBLIC_CLOUDFRONT_URL || ""

// Token mặc định cho các request không cần xác thực
const DEFAULT_TOKEN = process.env.NEXT_PUBLIC_DEFAULT_TOKEN || ""

// Kiểm tra và cảnh báo khi thiếu biến môi trường quan trọng
if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn("Missing NEXT_PUBLIC_API_URL environment variable. API calls may fail.")
}

if (!process.env.NEXT_PUBLIC_CLOUDFRONT_URL) {
  console.warn("Missing NEXT_PUBLIC_CLOUDFRONT_URL environment variable. Media files may not load correctly.")
}

// Tham số chung
export const DEFAULT_OPTION_SELLER = 1

class ApiClient {
  private instance: AxiosInstance
  private token: string | null = null

  constructor() {
    this.instance = axios.create({
      baseURL: API_URL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    })

    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        console.log("🚀 API Request:", {
          method: config.method?.toUpperCase(),
          url: config.url,
          params: config.params,
          data: config.data,
          headers: config.headers,
        })

        // Thêm token xác thực nếu có
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error) => {
        console.error("❌ API Request Error:", error)
        return Promise.reject(error)
      },
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        console.log("✅ API Response:", {
          status: response.status,
          url: response.config.url,
          data: response.data,
        })
        return response.data // Trả về data trực tiếp
      },
      (error) => {
        // Xử lý lỗi chung
        console.error("❌ API Response Error:", {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        })
        return Promise.reject(error)
      },
    )
  }

  // Kiểm tra URL hợp lệ trước khi sử dụng
  private validateUrl(url: string | undefined): string {
    if (!url || url.trim() === "") {
      console.error("Invalid URL: URL is empty or undefined")
      throw new Error("API URL is not configured properly")
    }
    return url
  }

  // Thiết lập token sau khi đăng nhập
  public setToken(token: string): void {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  // Lấy token (hữu ích để duy trì trạng thái xác thực)
  public getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
    return this.token
  }

  // Xóa token khi đăng xuất
  public clearToken(): void {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  // Lấy token mặc định cho các request không cần xác thực
  public getDefaultToken(): string {
    return DEFAULT_TOKEN
  }

  // Phương thức GET
  public async get<T = any>(url: string, params?: Record<string, any>, requireAuth = true): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Thêm token nếu cần
    if (requireAuth) {
      const token = this.getToken() || (requireAuth ? DEFAULT_TOKEN : "")
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    try {
      const response = await this.instance.get<T>(url, { params, headers })
      return response
    } catch (error) {
      console.error(`GET Error: ${url}`, error)
      throw error
    }
  }

  // Phương thức POST
  public async post<T = any>(url: string, data?: any, requireAuth = true): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Thêm token nếu cần
    if (requireAuth) {
      const token = this.getToken() || (requireAuth ? DEFAULT_TOKEN : "")
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    try {
      const response = await this.instance.post<T>(url, data, { headers })
      return response
    } catch (error) {
      console.error(`POST Error: ${url}`, error)
      throw error
    }
  }

  // Phương thức PUT
  public async put<T = any>(url: string, data?: any, requireAuth = true): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // Thêm token nếu cần
    if (requireAuth) {
      const token = this.getToken() || (requireAuth ? DEFAULT_TOKEN : "")
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    try {
      const response = await this.instance.put<T>(url, data, { headers })
      return response
    } catch (error) {
      console.error(`PUT Error: ${url}`, error)
      throw error
    }
  }

  // Helper cho URL file - Kiểm tra URL hợp lệ trước khi sử dụng
  public getFileUrl(path: string): string {
    if (!path) return ""
    if (!CLOUDFRONT_URL) {
      console.warn("CLOUDFRONT_URL is not configured. Media files may not load correctly.")
      return path
    }
    return `${CLOUDFRONT_URL}${path}`
  }
}

// Tạo và export một instance singleton
export const apiClient = new ApiClient()

export default apiClient

