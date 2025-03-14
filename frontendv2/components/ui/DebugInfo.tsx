"use client"

import { useState, useEffect } from "react"
import { API_MODE } from "@/config/apiConfig"

export function DebugInfo() {
  const [isVisible, setIsVisible] = useState(false)
  const [apiMode, setApiMode] = useState(API_MODE)

  useEffect(() => {
    // Kiểm tra xem có đang ở môi trường development không
    const isDev = process.env.NODE_ENV === "development"
    setIsVisible(isDev)

    // Lấy API mode từ localStorage hoặc environment variable
    const storedMode = typeof window !== "undefined" ? localStorage.getItem("API_MODE") : null

    setApiMode(storedMode || API_MODE)

    // Log thông tin debug
    if (isDev) {
      console.log("🔧 Debug Info:", {
        apiMode: storedMode || API_MODE,
        nodeEnv: process.env.NODE_ENV,
        nextPublicApiMode: process.env.NEXT_PUBLIC_API_MODE,
      })
    }
  }, [])

  const toggleApiMode = () => {
    const newMode = apiMode === "mock" ? "real" : "mock"
    setApiMode(newMode)
    localStorage.setItem("API_MODE", newMode)
    window.location.reload() // Reload để áp dụng thay đổi
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-3 rounded-lg shadow-lg text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">Debug Info</span>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>
      <div className="space-y-1">
        <p>
          Environment: <span className="font-mono">{process.env.NODE_ENV}</span>
        </p>
        <p>
          API Mode:
          <span className={`font-mono ml-1 ${apiMode === "mock" ? "text-yellow-400" : "text-green-400"}`}>
            {apiMode.toUpperCase()}
          </span>
          <button onClick={toggleApiMode} className="ml-2 px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-xs">
            Toggle
          </button>
        </p>
      </div>
    </div>
  )
}

