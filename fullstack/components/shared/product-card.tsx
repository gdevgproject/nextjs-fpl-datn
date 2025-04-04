"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/utils"
import { useAuth } from "@/lib/providers/auth-context"
import { useWishlistContext } from "@/features/wishlist/providers/wishlist-provider"
import { useCartContext } from "@/features/cart/providers/cart-provider"
import type { Product } from "@/lib/types/shared.types"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useQuery } from "@tanstack/react-query"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth()
  const { isInWishlist, toggleWishlist } = useWishlistContext()
  const { addToCart } = useCartContext()
  const { toast } = useToast()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)

  // Đảm bảo product.slug tồn tại
  const productSlug = product.slug || `product-${product.id}`

  // Tìm ảnh chính hoặc sử dụng ảnh đầu tiên
  const mainImage =
    product.images?.find((img) => img.is_main)?.image_url ||
    product.images?.[0]?.image_url ||
    `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(product.name)}`

  // Kiểm tra xem sản phẩm có giảm giá không
  const hasDiscount = product.sale_price !== null && product.sale_price > 0 && product.sale_price < product.price

  // Kiểm tra xem sản phẩm có trong danh sách yêu thích không
  const isWishlisted = isInWishlist(product.id)

  // Fetch product labels
  const { data: labels } = useQuery({
    queryKey: ["productLabels", product.id],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from("product_label_assignments")
        .select("label:product_labels(*)")
        .eq("product_id", product.id)

      if (error) {
        console.error("Error fetching product labels:", error)
        return []
      }
      return data?.map((item) => item.label) || []
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  // Fetch average rating
  const { data: avgRating } = useQuery({
    queryKey: ["averageRating", product.id],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", product.id)
        .eq("is_approved", true)

      if (error) {
        console.error("Error fetching average rating:", error)
        return 0
      }

      if (!data || data.length === 0) {
        return 0
      }

      const totalRating = data.reduce((sum, review) => sum + review.rating, 0)
      return totalRating / data.length
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  })

  // Determine the volume of the product
  const volume = product.variants && product.variants.length > 0 ? product.variants[0].volume_ml : null

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      setIsAddingToCart(true)

      // Kiểm tra sản phẩm và variants
      if (product && product.variants && product.variants.length > 0) {
        // Tìm variant có giá thấp nhất
        const sortedVariants = [...product.variants].sort((a, b) => {
          const priceA = a.sale_price || a.price
          const priceB = b.sale_price || b.price
          return priceA - priceB
        })

        const variantToAdd = sortedVariants[0]
        if (variantToAdd && variantToAdd.id) {
          await addToCart(variantToAdd.id, 1, product.id.toString())

          toast({
            title: "Đã thêm vào giỏ hàng",
            description: `${product.name} đã được thêm vào giỏ hàng của bạn.`,
          })
        } else {
          toast({
            title: "Không thể thêm vào giỏ hàng",
            description: "Không thể xác định biến thể sản phẩm.",
            variant: "destructive",
          })
        }
      } else {
        // Fallback khi không có variant
        toast({
          title: "Không thể thêm vào giỏ hàng",
          description: "Sản phẩm này không có biến thể nào.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Thêm vào giỏ hàng thất bại",
        description: "Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng.",
        variant: "destructive",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  // Xử lý thêm/xóa khỏi danh sách yêu thích
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      setIsTogglingWishlist(true)

      if (!isAuthenticated) {
        toast({
          title: "Vui lòng đăng nhập",
          description: "Bạn cần đăng nhập để thêm sản phẩm vào danh sách yêu thích.",
          variant: "default",
        })
        return
      }

      await toggleWishlist(product.id)
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    } finally {
      setIsTogglingWishlist(false)
    }
  }

  const handleImageLoad = () => {
    setIsImageLoading(false)
  }

  const handleImageError = () => {
    setIsImageLoading(false)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Link href={`/san-pham/${productSlug}`}>
          <div className="relative aspect-square overflow-hidden">
            {isImageLoading && <Skeleton className="absolute inset-0 h-full w-full" />}
            <Image
              src={mainImage || "/placeholder.svg"}
              alt={product.name}
              fill
              className={`object-cover transition-all duration-300 ${
                isImageLoading ? "opacity-0" : "opacity-100 hover:scale-105"
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
            {hasDiscount && (
              <Badge className="absolute left-2 top-2 bg-red-500 hover:bg-red-600">
                -{Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
              </Badge>
            )}
            <Button
              variant="secondary"
              size="icon"
              className={`absolute right-2 top-2 z-10 h-8 w-8 rounded-full shadow-md ${
                isWishlisted
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-white text-gray-700 hover:bg-white/90"
              }`}
              onClick={handleToggleWishlist}
              disabled={isTogglingWishlist}
            >
              {isTogglingWishlist ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
              )}
              <span className="sr-only">{isWishlisted ? "Xóa khỏi danh sách yêu thích" : "Thêm vào yêu thích"}</span>
            </Button>
          </div>
        </Link>
        <div className="p-4">
          {product.brand && <div className="text-xs text-muted-foreground">{product.brand.name}</div>}
          <Link href={`/san-pham/${productSlug}`} className="line-clamp-2 mt-1 font-medium hover:underline">
            {product.name}
          </Link>
          <div className="mt-2 flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="font-medium text-primary">{formatPrice(product.sale_price!)}</span>
                <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="font-medium text-primary">{formatPrice(product.price)}</span>
            )}
            {/* Display volume if it's a perfume product */}
            {volume && <span className="text-sm text-muted-foreground">{volume}ml</span>}
          </div>
          {/* Product Labels */}
          {labels && labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {labels.map((label) => (
                <Badge key={label.id} className="bg-secondary text-secondary-foreground">
                  {label.name}
                </Badge>
              ))}
            </div>
          )}
          {/* Average Rating */}
          {avgRating > 0 && (
            <div className="mt-2 flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={handleAddToCart} disabled={isAddingToCart}>
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
      </CardFooter>
    </Card>
  )
}

