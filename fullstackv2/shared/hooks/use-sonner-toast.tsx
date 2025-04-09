"use client"

import type React from "react"
import { toast as sonnerToast, type ToastOptions as SonnerToastOptions } from "sonner"

// Define our own ToastOptions type to avoid the export issue
export type ToastOptions = SonnerToastOptions

// Định nghĩa các loại toast phổ biến
export type ToastType = "default" | "success" | "error" | "info" | "warning"

// Interface cho hook
export interface UseSonnerToastReturn {
  // Các phương thức cơ bản
  toast: (message: React.ReactNode, options?: ToastOptions) => string | number
  success: (message: React.ReactNode, options?: ToastOptions) => string | number
  error: (message: React.ReactNode, options?: ToastOptions) => string | number
  info: (message: React.ReactNode, options?: ToastOptions) => string | number
  warning: (message: React.ReactNode, options?: ToastOptions) => string | number

  // Phương thức promise đơn giản hóa
  promise: <Data>(
    promise: Promise<Data>,
    messages: {
      loading: React.ReactNode
      success: React.ReactNode | ((data: Data) => React.ReactNode)
      error: React.ReactNode | ((error: unknown) => React.ReactNode)
    },
    options?: ToastOptions,
  ) => Promise<Data>

  // Phương thức quản lý cơ bản
  dismiss: (toastId?: string | number) => void
  update: (toastId: string | number, message: React.ReactNode, options?: ToastOptions) => void
}

// Tùy chọn mặc định
const defaultOptions: ToastOptions = {
  duration: 5000,
}

/**
 * Custom hook đơn giản hóa để sử dụng sonner toast
 * @param customOptions - Tùy chọn mặc định tùy chỉnh
 */
export function useSonnerToast(customOptions: ToastOptions = {}): UseSonnerToastReturn {
  // Kết hợp tùy chọn
  const mergeOptions = (options?: ToastOptions): ToastOptions => ({
    ...defaultOptions,
    ...customOptions,
    ...options,
  })

  // Các phương thức cơ bản
  const showToast = (message: React.ReactNode, options?: ToastOptions): string | number => {
    return sonnerToast(message, mergeOptions(options))
  }

  const showSuccessToast = (message: React.ReactNode, options?: ToastOptions): string | number => {
    return sonnerToast.success(message, mergeOptions(options))
  }

  const showErrorToast = (message: React.ReactNode, options?: ToastOptions): string | number => {
    return sonnerToast.error(message, mergeOptions(options))
  }

  const showInfoToast = (message: React.ReactNode, options?: ToastOptions): string | number => {
    return sonnerToast.info(message, mergeOptions(options))
  }

  const showWarningToast = (message: React.ReactNode, options?: ToastOptions): string | number => {
    return sonnerToast.warning(message, mergeOptions(options))
  }

  // Phương thức promise đơn giản hóa
  const promiseToast = <Data,>(
    promise: Promise<Data>,
    messages: {
      loading: React.ReactNode
      success: React.ReactNode | ((data: Data) => React.ReactNode)
      error: React.ReactNode | ((error: unknown) => React.ReactNode)
    },
    options?: ToastOptions,
  ): Promise<Data> => {
    const toastPromise = sonnerToast.promise(promise, {
      ...mergeOptions(options),
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    })

    // Return the original promise to ensure correct typing
    return promise
  }

  // Phương thức quản lý
  const dismissToast = (toastId?: string | number): void => {
    sonnerToast.dismiss(toastId)
  }

  const updateToast = (toastId: string | number, message: React.ReactNode, options?: ToastOptions): void => {
    sonnerToast.update(toastId, { ...mergeOptions(options), message })
  }

  return {
    toast: showToast,
    success: showSuccessToast,
    error: showErrorToast,
    info: showInfoToast,
    warning: showWarningToast,
    promise: promiseToast,
    dismiss: dismissToast,
    update: updateToast,
  }
}
