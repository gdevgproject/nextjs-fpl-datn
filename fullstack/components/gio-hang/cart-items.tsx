"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useCart } from "@/lib/hooks/use-cart"
import { CartItem } from "@/components/gio-hang/cart-item"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function CartItems() {
  const { items, updateQuantity, removeItem, clearCart, isLoading } = useCart()
  const [isClearing, setIsClearing] = useState(false)

  const handleClearCart = () => {
    setIsClearing(true)
    // Delay to allow animation to complete
    setTimeout(() => {
      clearCart()
      setIsClearing(false)
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col border-b p-4 last:border-0 sm:flex-row sm:items-center">
            <div className="mb-4 flex flex-1 items-center gap-4 sm:mb-0">
              <Skeleton className="h-24 w-24 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <Skeleton className="h-9 w-28" />
              <div className="flex flex-col items-end">
                <Skeleton className="h-4 w-16" />
                <div className="mt-2 flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-medium">Sản phẩm trong giỏ hàng</h2>
        {items.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 text-muted-foreground">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Xóa tất cả</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa tất cả sản phẩm?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearCart}>Xóa tất cả</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <AnimatePresence>
        <motion.div
          initial={false}
          animate={{ opacity: isClearing ? 0 : 1, height: isClearing ? 0 : "auto" }}
          transition={{ duration: 0.5 }}
        >
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
              onRemoveItem={() => removeItem(item.id)}
              lowStock={item.productId === "2"} // Giả lập sản phẩm sắp hết hàng
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {items.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Không có sản phẩm nào trong giỏ hàng</p>
        </div>
      )}
    </div>
  )
}

