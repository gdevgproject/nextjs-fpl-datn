export const formatCurrency = (amount: number, currency = "VND") => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(amount)
}

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export const formatPhoneNumber = (phoneNumber: string) => {
  // Format Vietnamese phone number
  return phoneNumber.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")
}

export const formatPrice = (price: number | undefined) => {
  if (price === undefined) return "0đ"
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

