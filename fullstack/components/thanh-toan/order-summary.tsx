"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, ShoppingBag, ShieldCheck, Truck, Clock } from "lucide-react"

import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/lib/hooks/use-cart"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function OrderSummary() {
  const { items, subtotal, discount, total, isLoading } = useCart()
  const [isExpanded, setIsExpanded] = useState(false)
  const shipping = 0 // Miễn phí vận chuyển
  const itemCount = items.length

  // Tự động mở rộng trên desktop, thu gọn trên mobile
  useEffect(() => {
    const handleResize = () => {
      setIsExpanded(window.innerWidth >= 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}

          <Separator className="my-4" />

          <div className="space-y-2">
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
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 md:hidden"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <span>Thu gọn</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Xem chi tiết</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardHeader>

      <CardContent className="pb-0">
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 overflow-hidden"
            >
              <div className="space-y-4">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        {item.quantity > 1 && (
                          <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                            {item.quantity}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-sm">
                        <Link href={`/san-pham/${item.slug}`} className="font-medium hover:text-primary">
                          {item.name}
                        </Link>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.brand} - {item.volume}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency((item.salePrice || item.price) * item.quantity)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <ShoppingBag className="mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="text-muted-foreground">Giỏ hàng trống</p>
                  </div>
                )}
              </div>
              <Separator className="my-4" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tạm tính ({itemCount} sản phẩm)</span>
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
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-4">
        {discount > 0 && (
          <div className="w-full rounded-md bg-green-50 p-2 text-center text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <Badge variant="outline" className="border-green-500 text-green-600">
              Tiết kiệm {formatCurrency(discount)}
            </Badge>
          </div>
        )}

        <div className="flex w-full flex-col gap-2 rounded-md bg-muted p-3 text-sm">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-medium">Cam kết của chúng tôi</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-3.5 w-3.5" />
            <span>Giao hàng nhanh chóng</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Sản phẩm chính hãng 100%</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Đổi trả trong 30 ngày</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

