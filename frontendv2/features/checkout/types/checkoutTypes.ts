export type DeliveryMethod = "delivery" | "pickup"

export type PaymentMethod = "cod" | "qr" | "bank" | "card" | "zalopay" | "momo" | "vnpay"

export interface CustomerInfo {
  fullName: string
  phone: string
  email?: string
}

export interface ShippingAddress {
  fullName: string
  phone: string
  province: string
  district: string
  ward: string
  address: string
  note?: string
}

export interface CheckoutFormData {
  deliveryMethod: DeliveryMethod
  customerInfo: CustomerInfo
  shippingAddress: ShippingAddress
  needInvoice: boolean
  paymentMethod: PaymentMethod
}

