"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "../context/cart-context"
import { formatCurrency } from "../utils/cart-calculations"
import type { CartItem as CartItemType } from "../context/cart-context"
import { toast } from "sonner"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateItem, removeItem } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [localQuantity, setLocalQuantity] = useState(item.quantity)
  const [optimisticTotal, setOptimisticTotal] = useState(
    ((item.sale_price && item.sale_price > 0 ? item.sale_price : item.price) || 0) * item.quantity,
  )

  // Get the current price (sale price or regular price)
  const currentPrice = item.sale_price && item.sale_price > 0 ? item.sale_price : item.price

  // Update local state when item changes
  useEffect(() => {
    setLocalQuantity(item.quantity)
    setOptimisticTotal(((item.sale_price && item.sale_price > 0 ? item.sale_price : item.price) || 0) * item.quantity)
  }, [item])

  // Handle quantity change with optimistic update
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity === localQuantity) return
    if (newQuantity <= 0) {
      handleRemove()
      return
    }

    // Check stock limit
    if (item.stock_quantity && newQuantity > item.stock_quantity) {
      toast.error(`Chỉ còn ${item.stock_quantity} sản phẩm trong kho`)
      return
    }

    // Optimistically update local state
    setLocalQuantity(newQuantity)
    setOptimisticTotal((currentPrice || 0) * newQuantity)

    setIsUpdating(true)
    try {
      await updateItem(item.id, newQuantity)
    } catch (error) {
      // Revert to original quantity on error
      setLocalQuantity(item.quantity)
      setOptimisticTotal((currentPrice || 0) * item.quantity)
      console.error("Failed to update item quantity:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle item removal with optimistic update
  const handleRemove = async () => {
    // Optimistically hide the item
    setIsRemoving(true)
    try {
      await removeItem(item.id)
    } catch (error) {
      setIsRemoving(false)
      console.error("Failed to remove item:", error)
    }
  }

  // If item is being removed, don't render it
  if (isRemoving) return null

  return (
    <div className="flex items-center py-4 border-b">
      {/* Product image */}
      <div className="w-20 h-20 relative flex-shrink-0 bg-gray-100 rounded overflow-hidden">
        {item.product_image ? (
          <Image
            src={item.product_image || "/placeholder.svg"}
            alt={item.product_name || "Product image"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
        )}
      </div>

      {/* Product details */}
      <div className="ml-4 flex-1">
        <Link href={`/san-pham/${item.product_id}`} className="font-medium hover:underline">
          <span className="text-muted-foreground">Tên sản phẩm:</span> {item.product_name || "Product"}
        </Link>
        {item.brand_name && (
          <p className="text-sm text-muted-foreground">
            <span className="text-muted-foreground">Thương hiệu:</span> {item.brand_name}
          </p>
        )}
        {item.volume_ml && (
          <p className="text-sm text-muted-foreground">
            <span className="text-muted-foreground">Dung tích:</span> {item.volume_ml}ml
          </p>
        )}
        {item.sku && (
          <p className="text-sm text-muted-foreground">
            <span className="text-muted-foreground">SKU:</span> {item.sku}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          <span className="text-muted-foreground">Số lượng:</span> {localQuantity}
        </p>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center">
            {/* Price display */}
            <div className="font-medium">
              <span className="text-muted-foreground">Giá:</span>{" "}
              {currentPrice !== undefined ? formatCurrency(currentPrice) : "N/A"}
            </div>

            {/* Show original price if on sale */}
            {item.sale_price && item.price && item.sale_price < item.price && (
              <div className="ml-2 text-sm text-muted-foreground line-through">{formatCurrency(item.price)}</div>
            )}
          </div>

          {/* Item total - use optimistic total */}
          <div className="font-medium">{formatCurrency(optimisticTotal)}</div>
        </div>
      </div>

      {/* Quantity controls */}
      <div className="ml-4 flex items-center">
        <div className="flex items-center border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
            onClick={() => handleQuantityChange(localQuantity - 1)}
            disabled={isUpdating || localQuantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <span className="w-10 text-center">{localQuantity}</span>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-none"
            onClick={() => handleQuantityChange(localQuantity + 1)}
            disabled={isUpdating || (item.stock_quantity !== undefined && localQuantity >= item.stock_quantity)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 text-destructive hover:text-destructive"
          onClick={handleRemove}
          disabled={isRemoving}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
