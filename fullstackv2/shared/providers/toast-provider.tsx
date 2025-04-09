"use client"

import type React from "react"
import { Toaster, type ToasterProps } from "sonner"
import { useTheme } from "next-themes"

interface ToastProviderProps extends Partial<ToasterProps> {
  children: React.ReactNode
}

export function ToastProvider({
  children,
  position = "bottom-right", // Thay đổi từ "top-center" thành "bottom-right"
  duration = 5000,
  closeButton = true,
  richColors = true,
  ...props
}: ToastProviderProps) {
  // Lấy theme từ next-themes
  const { theme, resolvedTheme } = useTheme()

  // Xác định theme cho Toaster (light, dark hoặc system)
  const toasterTheme = theme === "system" ? resolvedTheme : theme

  return (
    <>
      {children}
      <Toaster
        theme={toasterTheme as "light" | "dark" | undefined}
        position={position}
        duration={duration}
        closeButton={closeButton}
        richColors={richColors}
        {...props}
      />
    </>
  )
}
