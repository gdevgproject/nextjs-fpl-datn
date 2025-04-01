"use client"

import { motion } from "framer-motion"
import { useCart } from "@/lib/hooks/use-cart"
import { formatCurrency } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck, Truck, RotateCcw } from "lucide-react"

export function CartSummary() {
  const { subtotal, discount, total, isLoading, discountCode } = useCart()
  const shipping = 0 // Miễn phí vận chuyển

  if (isLoading) {
    return (
      <div className="rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Separator className="my-3" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="mt-4 space-y-3">
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-medium">Tổng giỏ hàng</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tạm tính</span>
          <motion.span
            key={subtotal}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {formatCurrency(subtotal)}
          </motion.span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Giảm giá</span>
          <motion.span
            key={discount}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-green-600"
          >
            {discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)}
          </motion.span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Phí vận chuyển</span>
          <span>{shipping === 0 ? "Miễn phí" : formatCurrency(shipping)}</span>
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between font-medium">
          <span>Tổng cộng</span>
          <motion.span
            key={total}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
            className="text-lg"
          >
            {formatCurrency(total)}
          </motion.span>
        </div>

        {/* Thông tin bổ sung */}
        <div className="mt-6 space-y-3 rounded-md bg-muted/50 p-3 text-sm">
          <div className="flex items-start gap-2">
            <Truck className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">Miễn phí vận chuyển</p>
              <p className="text-muted-foreground">Cho đơn hàng từ 500.000₫</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">Cam kết chính hãng 100%</p>
              <p className="text-muted-foreground">Hoàn tiền gấp 10 lần nếu phát hiện hàng giả</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <RotateCcw className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="font-medium">Đổi trả dễ dàng</p>
              <p className="text-muted-foreground">Trong vòng 7 ngày nếu sản phẩm còn nguyên vẹn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

