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

