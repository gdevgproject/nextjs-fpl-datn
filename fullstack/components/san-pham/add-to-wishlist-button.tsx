"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Heart, Loader2 } from "lucide-react"
import { useWishlist } from "@/lib/hooks/use-wishlist"
import { useAuth } from "@/lib/hooks/use-auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

interface AddToWishlistButtonProps {
  productId: number
  productName: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  showText?: boolean
  withFeedback?: boolean
}

export function AddToWishlistButton({
  productId,
  productName,
  className,
  variant = "outline",
  size = "icon",
  showText = false,
  withFeedback = true,
}: AddToWishlistButtonProps) {
  const { user, isLoading: authLoading } = useAuth()
  const { addItem, removeItem, isInWishlist, items } = useWishlist()
  const [isLoading, setIsLoading] = useState(false)
  const [isInList, setIsInList] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  // Kiểm tra xem sản phẩm có trong danh sách yêu thích không
  useEffect(() => {
    if (!authLoading) {
      const inWishlist = isInWishlist(productId)
      setIsInList(inWishlist)
    }
  }, [productId, isInWishlist, authLoading, items])

  const handleToggleWishlist = async () => {
    if (!user) {
      setShowLoginDialog(true)
      return
    }

    setIsLoading(true)

    try {
      if (isInList) {
        // Tìm ID của item trong danh sách yêu thích
        const wishlistItem = items.find((item) => item.product_id === productId)
        if (wishlistItem) {
          await removeItem(wishlistItem.id)

          if (withFeedback) {
            toast({
              title: "Đã xóa khỏi danh sách yêu thích",
              description: `${productName} đã được xóa khỏi danh sách yêu thích của bạn`,
            })
          }
        }
      } else {
        await addItem(productId)

        if (withFeedback) {
          setShowFeedback(true)
        }
      }

      setIsInList(!isInList)
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant={isInList ? "default" : variant}
        size={size}
        className={className}
        onClick={handleToggleWishlist}
        disabled={isLoading}
        aria-label={
          isInList ? `Xóa ${productName} khỏi danh sách yêu thích` : `Thêm ${productName} vào danh sách yêu thích`
        }
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`h-4 w-4 ${isInList ? "fill-current" : ""}`} />
        )}
        {showText && <span className="ml-2">{isInList ? "Đã yêu thích" : "Yêu thích"}</span>}
      </Button>

      {/* Dialog đăng nhập */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đăng nhập để thêm vào yêu thích</DialogTitle>
            <DialogDescription>Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
              Để sau
            </Button>
            <Button asChild>
              <Link href="/dang-nhap">Đăng nhập ngay</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog phản hồi */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đã thêm vào danh sách yêu thích</DialogTitle>
            <DialogDescription>{productName} đã được thêm vào danh sách yêu thích của bạn.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowFeedback(false)}>
              Tiếp tục mua sắm
            </Button>
            <Button asChild>
              <Link href="/tai-khoan/yeu-thich">Xem danh sách yêu thích</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

