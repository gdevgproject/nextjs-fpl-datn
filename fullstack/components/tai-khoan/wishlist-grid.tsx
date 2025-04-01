"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { toast } from "@/components/ui/use-toast"
import { ShoppingCart, Loader2, Trash2, Heart, Share2, Eye } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWishlist } from "@/lib/hooks/use-wishlist"
import { useMediaQuery } from "@/hooks/use-media-query"

interface WishlistGridProps {
  items: {
    id: number
    product_id: number
    product_name: string
    price: number
    sale_price: number | null
    image: string
    brand: string
    added_at: string
    is_in_stock?: boolean
  }[]
  selectedItems?: number[]
  onSelectItem?: (id: number, isSelected: boolean) => void
  onSelectAll?: (isSelected: boolean) => void
}

export function WishlistGrid({ items, selectedItems = [], onSelectItem, onSelectAll }: WishlistGridProps) {
  const { removeItem } = useWishlist()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  const handleRemoveFromWishlist = async (id: number) => {
    setLoadingStates((prev) => ({ ...prev, [`remove-${id}`]: true }))

    try {
      await removeItem(id)
    } catch (error) {
      console.error("Error removing item from wishlist:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa sản phẩm khỏi danh sách yêu thích. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`remove-${id}`]: false }))
    }
  }

  const handleAddToCart = (id: number, productName: string) => {
    setLoadingStates((prev) => ({ ...prev, [`cart-${id}`]: true }))

    // Giả lập API call
    setTimeout(() => {
      toast({
        title: "Đã thêm vào giỏ hàng",
        description: `${productName} đã được thêm vào giỏ hàng của bạn`,
      })
      setLoadingStates((prev) => ({ ...prev, [`cart-${id}`]: false }))
    }, 500)
  }

  const handleShare = async (productName: string, productId: number) => {
    const url = `${window.location.origin}/san-pham/${productId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Xem sản phẩm ${productName} tại MyBeauty`,
          url: url,
        })
      } catch (error) {
        console.error("Lỗi khi chia sẻ:", error)
      }
    } else {
      // Fallback cho các trình duyệt không hỗ trợ Web Share API
      navigator.clipboard.writeText(url)
      toast({
        title: "Đã sao chép liên kết",
        description: "Liên kết đến sản phẩm đã được sao chép vào clipboard",
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Heart className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-medium">Danh sách yêu thích trống</h3>
        <p className="mb-4 text-sm text-muted-foreground">Bạn chưa có sản phẩm nào trong danh sách yêu thích</p>
        <Button asChild>
          <Link href="/san-pham">Khám phá sản phẩm</Link>
        </Button>
      </div>
    )
  }

  // Tính toán số cột dựa trên kích thước màn hình
  const getGridCols = () => {
    if (isMobile) return "grid-cols-1"
    if (isTablet) return "grid-cols-2"
    return "grid-cols-3 xl:grid-cols-4"
  }

  return (
    <div className="space-y-4">
      {onSelectAll && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectedItems.length === items.length && items.length > 0}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
          />
          <label
            htmlFor="select-all"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Chọn tất cả
          </label>
        </div>
      )}

      <div className={`grid ${getGridCols()} gap-4`}>
        {items.map((item) => (
          <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-md">
            <div className="relative">
              {onSelectItem && (
                <div className="absolute left-2 top-2 z-20">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) => onSelectItem(item.id, !!checked)}
                    className="h-5 w-5 border-2 bg-background/80"
                  />
                </div>
              )}

              <div className="relative aspect-square overflow-hidden">
                <Link href={`/san-pham/${item.product_id}`}>
                  <Image
                    src={item.image || "/placeholder.svg?height=300&width=300"}
                    alt={item.product_name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </Link>

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/0 opacity-0 transition-all group-hover:bg-black/5 group-hover:opacity-100">
                  <div className="absolute bottom-2 right-2 flex flex-col gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-sm"
                            onClick={() => handleShare(item.product_name, item.product_id)}
                          >
                            <Share2 className="h-4 w-4" />
                            <span className="sr-only">Chia sẻ</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>Chia sẻ sản phẩm</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm" asChild>
                            <Link href={`/san-pham/${item.product_id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Xem chi tiết</span>
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p>Xem chi tiết</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="absolute right-2 top-2 z-10">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Xóa khỏi yêu thích</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          disabled={loadingStates[`remove-${item.id}`]}
                        >
                          {loadingStates[`remove-${item.id}`] ? (
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

                {item.sale_price && (
                  <Badge variant="destructive" className="absolute left-2 top-2 z-10">
                    Giảm {Math.round(((item.price - item.sale_price) / item.price) * 100)}%
                  </Badge>
                )}

                {item.is_in_stock === false && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                    <Badge variant="outline" className="bg-background/90 text-foreground">
                      Hết hàng
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{item.brand}</p>
                <Link href={`/san-pham/${item.product_id}`} className="line-clamp-2 font-medium hover:underline">
                  {item.product_name}
                </Link>
                <div className="flex items-center space-x-2">
                  {item.sale_price ? (
                    <>
                      <p className="font-medium">{formatCurrency(item.sale_price)}</p>
                      <p className="text-sm text-muted-foreground line-through">{formatCurrency(item.price)}</p>
                    </>
                  ) : (
                    <p className="font-medium">{formatCurrency(item.price)}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Đã thêm vào: {new Date(item.added_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
              <Button
                className="w-full"
                onClick={() => handleAddToCart(item.id, item.product_name)}
                disabled={loadingStates[`cart-${item.id}`] || item.is_in_stock === false}
              >
                {loadingStates[`cart-${item.id}`] ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang thêm
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {item.is_in_stock === false ? "Hết hàng" : "Thêm vào giỏ hàng"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

