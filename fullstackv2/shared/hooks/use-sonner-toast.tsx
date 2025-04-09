"use client";

import type React from "react";
import { toast as sonnerToast, type ToastOptions } from "sonner";

// Định nghĩa các loại toast phổ biến
export type ToastType = "default" | "success" | "error" | "info" | "warning";

// Interface cho hook
export interface UseSonnerToastReturn {
  // Các phương thức cơ bản
  toast: (message: string | React.ReactNode, options?: ToastOptions) => string;
  success: (
    message: string | React.ReactNode,
    options?: ToastOptions
  ) => string;
  error: (message: string | React.ReactNode, options?: ToastOptions) => string;
  info: (message: string | React.ReactNode, options?: ToastOptions) => string;
  warning: (
    message: string | React.ReactNode,
    options?: ToastOptions
  ) => string;

  // Phương thức promise đơn giản hóa
  promise: <Data>(
    promise: Promise<Data>,
    messages: {
      loading: string | React.ReactNode;
      success:
        | string
        | React.ReactNode
        | ((data: Data) => React.ReactNode | string);
      error:
        | string
        | React.ReactNode
        | ((error: unknown) => React.ReactNode | string);
    },
    options?: ToastOptions
  ) => Promise<Data>;

  // Phương thức quản lý cơ bản
  dismiss: (toastId?: string) => void;
  update: (
    toastId: string,
    message: string | React.ReactNode,
    options?: ToastOptions
  ) => void;
}

// Tùy chọn mặc định
const defaultOptions: ToastOptions = {
  duration: 5000,
};

/**
 * Custom hook đơn giản hóa để sử dụng sonner toast
 * @param customOptions - Tùy chọn mặc định tùy chỉnh
 */
export function useSonnerToast(
  customOptions: ToastOptions = {}
): UseSonnerToastReturn {
  // Kết hợp tùy chọn
  const mergeOptions = (options?: ToastOptions): ToastOptions => ({
    ...defaultOptions,
    ...customOptions,
    ...options,
  });

  // Các phương thức cơ bản
  const showToast = (
    message: string | React.ReactNode,
    options?: ToastOptions
  ): string => {
    return sonnerToast(message, mergeOptions(options));
  };

  const showSuccessToast = (
    message: string | React.ReactNode,
    options?: ToastOptions
  ): string => {
    return sonnerToast.success(message, mergeOptions(options));
  };

  const showErrorToast = (
    message: string | React.ReactNode,
    options?: ToastOptions
  ): string => {
    return sonnerToast.error(message, mergeOptions(options));
  };

  const showInfoToast = (
    message: string | React.ReactNode,
    options?: ToastOptions
  ): string => {
    return sonnerToast.info(message, mergeOptions(options));
  };

  const showWarningToast = (
    message: string | React.ReactNode,
    options?: ToastOptions
  ): string => {
    return sonnerToast.warning(message, mergeOptions(options));
  };

  // Phương thức promise đơn giản hóa
  const promiseToast = <Data,>(
    promise: Promise<Data>,
    messages: {
      loading: string | React.ReactNode;
      success:
        | string
        | React.ReactNode
        | ((data: Data) => React.ReactNode | string);
      error:
        | string
        | React.ReactNode
        | ((error: unknown) => React.ReactNode | string);
    },
    options?: ToastOptions
  ): Promise<Data> => {
    return sonnerToast.promise(promise, {
      ...mergeOptions(options),
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  };

  // Phương thức quản lý
  const dismissToast = (toastId?: string): void => {
    sonnerToast.dismiss(toastId);
  };

  const updateToast = (
    toastId: string,
    message: string | React.ReactNode,
    options?: ToastOptions
  ): void => {
    sonnerToast.update(toastId, { ...mergeOptions(options), message });
  };

  return {
    toast: showToast,
    success: showSuccessToast,
    error: showErrorToast,
    info: showInfoToast,
    warning: showWarningToast,
    promise: promiseToast,
    dismiss: dismissToast,
    update: updateToast,
  };
}
