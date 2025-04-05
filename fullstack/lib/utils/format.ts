export function formatPhoneNumber(phoneNumber: string): string {
  // Định dạng số điện thoại Việt Nam
  if (!phoneNumber) return ""

  // Loại bỏ tất cả ký tự không phải số
  const cleaned = phoneNumber.replace(/\D/g, "")

  // Kiểm tra độ dài và định dạng theo chuẩn Việt Nam
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  } else if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }

  return phoneNumber
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function formatOrderId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`
}

/**
 * Format a date to a human-readable string
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format an order number with padding
 */
export function formatOrderNumber(id: number): string {
  return `#${id.toString().padStart(6, "0")}`
}

