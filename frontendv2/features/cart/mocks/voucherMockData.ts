export interface Voucher {
  code: string
  description: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minOrderValue: number
  maxDiscount?: number
  expiryDate: string
  isActive: boolean
  type?: string
}

export const vouchers: Voucher[] = [
  {
    code: "REF46",
    description: "Ưu đã 20k | Giảm giá 20% - Đơn hàng từ 50k",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 50000,
    maxDiscount: 20000,
    expiryDate: "2025-02-15T15:30:00",
    isActive: true,
    type: "Tặng người giới thiệu",
  },
  {
    code: "WELCOME10",
    description: "Giảm 10% cho đơn hàng từ 100.000đ",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 100000,
    maxDiscount: 50000,
    expiryDate: "2025-12-31",
    isActive: true,
    type: "Tặng người giới thiệu",
  },
  {
    code: "SAVE20K",
    description: "Giảm 20.000đ cho đơn hàng từ 200.000đ",
    discountType: "fixed",
    discountValue: 20000,
    minOrderValue: 200000,
    expiryDate: "2025-12-31",
    isActive: true,
    type: "Tặng người giới thiệu",
  },
  {
    code: "SPECIAL25",
    description: "Giảm 25% cho đơn hàng từ 500.000đ",
    discountType: "percentage",
    discountValue: 25,
    minOrderValue: 500000,
    maxDiscount: 100000,
    expiryDate: "2025-12-31",
    isActive: true,
    type: "Tặng người giới thiệu",
  },
]

export function validateVoucher(code: string, orderValue: number): Voucher | null {
  const voucher = vouchers.find((v) => v.code === code && v.isActive)
  if (!voucher) return null

  if (orderValue < voucher.minOrderValue) return null

  if (new Date(voucher.expiryDate) < new Date()) return null

  return voucher
}

export function calculateVoucherDiscount(voucher: Voucher, orderValue: number): number {
  if (voucher.discountType === "fixed") {
    return voucher.discountValue
  }

  const discount = (orderValue * voucher.discountValue) / 100
  if (voucher.maxDiscount) {
    return Math.min(discount, voucher.maxDiscount)
  }
  return discount
}

