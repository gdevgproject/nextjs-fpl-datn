"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { ShoppingCart, Trash2, X, Loader2 } from "lucide-react"
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
import { useWishlist } from "@/lib/hooks/use-wishlist"

interface WishlistBulkActionsProps {
  selectedCount: number
  selectedItems: number[]
  onClearSelection: () => void
}

export function WishlistBulkActions({ selectedCount, selectedItems, onClearSelection }: WishlistBulkActionsProps) {
  const { removeItem } = useWishlist()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleAddSelectedToCart = async () => {
    setIsAddingToCart(true)

    // Giả lập API call
    setTimeout(() => {
      toast({
        title: "Đã thêm vào giỏ hàng",
        description: `${selectedCount} sản phẩm đã được thêm vào giỏ hàng của bạn`,
      })
      setIsAddingToCart(false)
      onClearSelection()
    }, 1000)
  }

  const handleRemoveSelected = async () => {
    setIsRemoving(true)

    try {
      // Xóa từng sản phẩm
      for (const id of selectedItems) {
        await removeItem(id)
      }

      toast({
        title: "Đã xóa khỏi danh sách yêu thích",
        description: `${selectedCount} sản phẩm đã được xóa khỏi danh sách yêu thích của bạn`,
      })
    } catch (error) {
      console.error("Error removing items from wishlist:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa sản phẩm khỏi danh sách yêu thích. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsRemoving(false)
      onClearSelection()
    }
  }

  return (
    <div className="flex items-center justify-between rounded-lg bg-muted p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Đã chọn {selectedCount} sản phẩm</span>
        <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onClearSelection}>
          <X className="mr-1 h-4 w-4" />
          Bỏ chọn
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" onClick={handleAddSelectedToCart} disabled={isAddingToCart}>
          {isAddingToCart ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang thêm...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Thêm vào giỏ hàng
            </>
          )}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa {selectedCount} sản phẩm đã chọn khỏi danh sách yêu thích?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveSelected} disabled={isRemoving}>
                {isRemoving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xóa
                  </>
                ) : (
                  "Xác nhận"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

