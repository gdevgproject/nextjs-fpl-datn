"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { ShoppingCart, Loader2, Trash2, Heart, Share2, ArrowUpDown, Eye } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWishlist } from "@/lib/hooks/use-wishlist"

interface WishlistListProps {
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

export function WishlistList({ items, selectedItems = [], onSelectItem, onSelectAll }: WishlistListProps) {
  const { removeItem } = useWishlist()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)

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

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  const getSortedItems = () => {
    if (!sortConfig) return items

    return [...items].sort((a, b) => {
      if (sortConfig.key === "product_name") {
        return sortConfig.direction === "ascending"
          ? a.product_name.localeCompare(b.product_name)
          : b.product_name.localeCompare(a.product_name)
      }

      if (sortConfig.key === "price") {
        const priceA = a.sale_price || a.price
        const priceB = b.sale_price || b.price
        return sortConfig.direction === "ascending" ? priceA - priceB : priceB - priceA
      }

      if (sortConfig.key === "added_at") {
        return sortConfig.direction === "ascending"
          ? new Date(a.added_at).getTime() - new Date(b.added_at).getTime()
          : new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
      }

      return 0
    })
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectAll && (
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedItems.length === items.length && items.length > 0}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                />
              </TableHead>
            )}
            <TableHead className="w-[80px]">Hình ảnh</TableHead>
            <TableHead>
              <div className="flex items-center cursor-pointer" onClick={() => requestSort("product_name")}>
                Sản phẩm
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Thương hiệu</TableHead>
            <TableHead>
              <div className="flex items-center cursor-pointer" onClick={() => requestSort("price")}>
                Giá
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center cursor-pointer" onClick={() => requestSort("added_at")}>
                Ngày thêm
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getSortedItems().map((item) => (
            <TableRow key={item.id}>
              {onSelectItem && (
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) => onSelectItem(item.id, !!checked)}
                  />
                </TableCell>
              )}
              <TableCell>
                <div className="relative h-16 w-16 overflow-hidden rounded-md">
                  <Link href={`/san-pham/${item.product_id}`}>
                    <Image
                      src={item.image || "/placeholder.svg?height=64&width=64"}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </Link>
                  {item.is_in_stock === false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Badge variant="outline" className="bg-background/90 text-foreground text-xs">
                        Hết hàng
                      </Badge>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Link href={`/san-pham/${item.product_id}`} className="font-medium hover:underline">
                  {item.product_name}
                </Link>
                {item.sale_price && (
                  <Badge variant="destructive" className="ml-2">
                    -{Math.round(((item.price - item.sale_price) / item.price) * 100)}%
                  </Badge>
                )}
              </TableCell>
              <TableCell>{item.brand}</TableCell>
              <TableCell>
                {item.sale_price ? (
                  <div>
                    <span className="font-medium">{formatCurrency(item.sale_price)}</span>
                    <span className="ml-2 text-sm text-muted-foreground line-through">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                ) : (
                  <span className="font-medium">{formatCurrency(item.price)}</span>
                )}
              </TableCell>
              <TableCell>{new Date(item.added_at).toLocaleDateString("vi-VN")}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/san-pham/${item.product_id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Xem chi tiết</span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Xem chi tiết</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleShare(item.product_name, item.product_id)}
                        >
                          <Share2 className="h-4 w-4" />
                          <span className="sr-only">Chia sẻ</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Chia sẻ sản phẩm</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="default"
                    size="sm"
                    className="h-8"
                    onClick={() => handleAddToCart(item.id, item.product_name)}
                    disabled={loadingStates[`cart-${item.id}`] || item.is_in_stock === false}
                  >
                    {loadingStates[`cart-${item.id}`] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="mr-1 h-4 w-4" />
                        <span className="sr-only md:not-sr-only md:inline-block">
                          {item.is_in_stock === false ? "Hết hàng" : "Thêm vào giỏ"}
                        </span>
                      </>
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Xóa</span>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

