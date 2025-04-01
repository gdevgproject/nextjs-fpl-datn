"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Trash2, Heart, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { QuantitySelector } from "@/components/gio-hang/quantity-selector"
import { formatCurrency } from "@/lib/utils"
import { useWishlist } from "@/lib/hooks/use-wishlist"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { CartItem as CartItemType } from "@/lib/hooks/use-cart"

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (quantity: number) => void
  onRemoveItem: () => void
  lowStock?: boolean
}

export function CartItem({ item, onUpdateQuantity, onRemoveItem, lowStock = false }: CartItemProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const { addItem } = useWishlist()
  const { toast } = useToast()
  const displayPrice = item.salePrice || item.price
  const totalPrice = displayPrice * item.quantity
  const isOnSale = item.salePrice !== null
  const discountPercentage = isOnSale ? Math.round(((item.price - item.salePrice!) / item.price) * 100) : 0

  const handleRemove = () => {
    setIsRemoving(true)
    // Delay to allow animation to complete
    setTimeout(() => {
      onRemoveItem()
    }, 300)
  }

  const moveToWishlist = () => {
    addItem({
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      brand: item.brand,
      image: item.image,
      price: item.price,
      salePrice: item.salePrice,
    })
    toast({
      title: "Đã thêm vào danh sách yêu thích",
      description: `${item.name} đã được thêm vào danh sách yêu thích.`,
    })
    onRemoveItem()
  }

  return (
    <motion.div
      className="flex flex-col border-b p-4 last:border-0 sm:flex-row sm:items-center"
      initial={{ opacity: 1, height: "auto" }}
      animate={{
        opacity: isRemoving ? 0 : 1,
        height: isRemoving ? 0 : "auto",
        marginBottom: isRemoving ? 0 : "auto",
      }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex flex-1 items-center gap-4 sm:mb-0">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
          <Link href={`/san-pham/${item.slug}`}>
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
            {isOnSale && (
              <div className="absolute left-0 top-0 rounded-br-md bg-red-500 px-1.5 py-0.5 text-xs font-medium text-white">
                -{discountPercentage}%
              </div>
            )}
          </Link>
        </div>
        <div>
          <Link href={`/san-pham/${item.slug}`} className="font-medium hover:text-primary">
            {item.name}
          </Link>
          <div className="mt-1 text-sm text-muted-foreground">
            {item.brand} - {item.volume}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-medium">{formatCurrency(displayPrice)}</span>
            {isOnSale && (
              <span className="text-xs text-muted-foreground line-through">{formatCurrency(item.price)}</span>
            )}
          </div>
          {lowStock && (
            <div className="mt-1 flex items-center text-xs text-amber-600">
              <AlertCircle className="mr-1 h-3 w-3" />
              Chỉ còn 2 sản phẩm
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <QuantitySelector value={item.quantity} onChange={onUpdateQuantity} min={1} max={10} className="h-9" />
        <div className="flex flex-col items-end">
          <div className="font-medium">{formatCurrency(totalPrice)}</div>
          <div className="mt-2 flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={moveToWishlist}
                  >
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Lưu vào yêu thích</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lưu vào yêu thích</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={handleRemove}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Xóa</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Xóa khỏi giỏ hàng</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

