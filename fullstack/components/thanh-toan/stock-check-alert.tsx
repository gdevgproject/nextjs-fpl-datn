"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, X, ShoppingCart, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/hooks/use-cart"

interface StockCheckAlertProps {
  productName: string
  available: number
  onClose: () => void
}

export function StockCheckAlert({ productName, available, onClose }: StockCheckAlertProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const router = useRouter()
  const { updateItemQuantity } = useCart()

  const handleUpdateCart = async () => {
    setIsUpdating(true)
    try {
      // Giả lập cập nhật giỏ hàng
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // Trong thực tế, cần gọi API để cập nhật giỏ hàng
      // await updateItemQuantity(productId, available)
      setIsVisible(false)
      setTimeout(onClose, 300) // Đợi animation kết thúc
    } catch (error) {
      console.error("Error updating cart:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Alert variant="destructive" className="relative">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="mb-2 font-medium">Sản phẩm không đủ số lượng</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                Sản phẩm <span className="font-medium">{productName}</span> chỉ còn{" "}
                <span className="font-medium">{available}</span> sản phẩm trong kho.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1 border-destructive/50 hover:bg-destructive/10"
                  onClick={handleUpdateCart}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>Cập nhật giỏ hàng</span>
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => router.push("/gio-hang")}>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Xem giỏ hàng</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => {
                    setIsVisible(false)
                    setTimeout(onClose, 300)
                  }}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  <span>Tiếp tục thanh toán</span>
                </Button>
              </div>
            </AlertDescription>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1 h-6 w-6 rounded-full p-0 text-destructive-foreground/70 hover:bg-destructive-foreground/10 hover:text-destructive-foreground"
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Đóng</span>
            </Button>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

