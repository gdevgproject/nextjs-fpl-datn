"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/lib/hooks/use-cart"

interface BuyNowButtonProps {
  productId: string
  variantId: string
  name: string
  slug: string
  brand: string
  image: string
  price: number
  salePrice: number | null
  volume: string
  quantity?: number
  className?: string
}

export function BuyNowButton({
  productId,
  variantId,
  name,
  slug,
  brand,
  image,
  price,
  salePrice,
  volume,
  quantity = 1,
  className,
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { addItem, clearCart } = useCart()
  const { toast } = useToast()

  const handleBuyNow = async () => {
    setIsLoading(true)

    try {
      // Xóa giỏ hàng hiện tại
      await clearCart()

      // Thêm sản phẩm vào giỏ hàng
      await addItem({
        productId,
        variantId,
        name,
        slug,
        brand,
        image,
        price,
        salePrice,
        volume,
        quantity,
      })

      // Chuyển hướng đến trang thanh toán
      router.push("/thanh-toan")
    } catch (error) {
      console.error("Error buying now:", error)
      toast({
        title: "Lỗi",
        description: "Không thể mua ngay. Vui lòng thử lại sau.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleBuyNow} className={`gap-2 ${className}`} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Đang xử lý...</span>
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          <span>Mua ngay</span>
        </>
      )}
    </Button>
  )
}

