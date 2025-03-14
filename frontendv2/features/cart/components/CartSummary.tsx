"use client"

import { Button } from "@/components/ui/Button"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatPrice } from "@/utils/format"
import { ChevronRight, Coins, HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { calculateVoucherDiscount, validateVoucher } from "../mocks/voucherMockData"
import type { CartItem } from "../types"
import { PromotionModal } from "./PromotionModal"

interface CartSummaryProps {
  items: CartItem[]
  selectedItems: string[]
}

export function CartSummary({ items, selectedItems }: CartSummaryProps) {
  const router = useRouter()
  const [usePoints, setUsePoints] = useState(false)
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false)
  const [appliedPromoCode, setAppliedPromoCode] = useState("")
  const [summary, setSummary] = useState({
    subtotal: 0,
    directDiscount: 0,
    pointsDiscount: 0,
    voucherDiscount: 0,
    total: 0,
    rewardPoints: 0,
    savedAmount: 0,
  })

  // Tính toán tổng tiền và các giảm giá mỗi khi có thay đổi
  useEffect(() => {
    const selectedProducts = items.filter((item) => selectedItems.includes(item.id))

    // Tổng tiền gốc
    const subtotal = selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0)

    // Giảm giá trực tiếp
    const directDiscount = selectedProducts.reduce((sum, item) => {
      if (!item.originalPrice) return sum
      return sum + (item.originalPrice - item.price) * item.quantity
    }, 0)

    // Điểm thưởng (1% tổng tiền)
    const rewardPoints = Math.floor(subtotal * 0.01)

    // Giảm giá từ điểm tích lũy
    const pointsDiscount = usePoints ? 25000 : 0

    // Tính voucher discount nếu có
    const voucherDiscount = appliedPromoCode
      ? calculateVoucherDiscount(validateVoucher(appliedPromoCode, subtotal)!, subtotal)
      : 0

    // Tổng tiết kiệm
    const savedAmount = directDiscount + pointsDiscount + voucherDiscount

    // Thành tiền
    const total = Math.max(0, subtotal - savedAmount)

    setSummary({
      subtotal,
      directDiscount,
      pointsDiscount,
      voucherDiscount,
      total,
      rewardPoints,
      savedAmount,
    })
  }, [items, selectedItems, usePoints, appliedPromoCode])

  const handleApplyPromoCode = (code: string) => {
    const voucher = validateVoucher(code, summary.subtotal)
    if (voucher) {
      setAppliedPromoCode(code)
    } else {
      setAppliedPromoCode("")
    }
    setIsPromoModalOpen(false)
  }

  const handleCheckout = () => {
    router.push("/checkout")
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div
        className="flex items-center justify-between text-blue-600 cursor-pointer hover:underline"
        onClick={() => setIsPromoModalOpen(true)}
      >
        <span>Áp dụng ưu đãi để được giảm giá</span>
        <ChevronRight className="w-4 h-4" />
      </div>

      <div className="flex items-center justify-between py-2 border-t">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-yellow-500" />
          <span>Đổi 25.000 điểm (25.000đ)</span>
        </div>
        <Switch checked={usePoints} onCheckedChange={setUsePoints} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Tổng tiền</span>
          <span>{formatPrice(summary.subtotal)}</span>
        </div>

        <div className="flex justify-between text-blue-600">
          <span>Giảm giá trực tiếp</span>
          <span>-{formatPrice(summary.directDiscount)}</span>
        </div>

        {usePoints && (
          <div className="flex justify-between text-blue-600">
            <span>Trừ tích điểm</span>
            <span>-{formatPrice(summary.pointsDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <div className="flex items-center gap-1">
            <span>Giảm giá voucher</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Áp dụng mã giảm giá để được ưu đãi</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span>{formatPrice(summary.voucherDiscount)}</span>
        </div>

        <div className="flex justify-between">
          <span>Phí vận chuyển</span>
          <span className="text-blue-600">(miễn phí)</span>
        </div>
      </div>

      <div className="pt-2 border-t">
        <div className="flex items-center gap-1 text-sm">
          <Coins className="w-4 h-4 text-yellow-500" />
          <span>Điểm thưởng</span>
          <span className="text-yellow-500">{summary.rewardPoints} điểm</span>
        </div>
        <div className="text-sm text-orange-500">
          Tiết kiệm được {formatPrice(summary.savedAmount)}
        </div>
      </div>

      <div className="pt-2 border-t">
        <div className="flex justify-between items-center mb-4">
          <span>Thành tiền</span>
          <div className="text-right">
            <span className="text-gray-500 line-through text-sm">
              {formatPrice(summary.subtotal)}
            </span>
            <div className="text-blue-600 text-xl font-bold">{formatPrice(summary.total)}</div>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={selectedItems.length === 0}
        >
          Mua hàng
        </Button>

        <p className="mt-4 text-xs text-center text-gray-500">
          Bằng việc tiến hành đặt mua hàng, bạn đồng ý với{" "}
          <a href="#" className="underline">
            Điều khoản dịch vụ
          </a>{" "}
          và{" "}
          <a href="#" className="underline">
            Chính sách xử lý dữ liệu cá nhân
          </a>{" "}
          của Nhà thuốc Elela
        </p>
      </div>

      <PromotionModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        onApply={handleApplyPromoCode}
      />
    </div>
  )
}
