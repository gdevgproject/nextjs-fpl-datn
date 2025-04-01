"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, ShoppingCart, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/lib/hooks/use-cart"
import { useWishlist } from "@/lib/hooks/use-wishlist"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Giả lập dữ liệu sản phẩm gợi ý
const suggestedProducts = [
  {
    id: "p1",
    name: "Chanel Coco Mademoiselle",
    slug: "chanel-coco-mademoiselle",
    brand: "Chanel",
    image: "/placeholder.svg?height=200&width=200",
    price: 3200000,
    salePrice: null,
    variantId: "v1",
    volume: "50ml",
    isNew: true,
    isBestSeller: false,
  },
  {
    id: "p2",
    name: "Dior Sauvage",
    slug: "dior-sauvage",
    brand: "Dior",
    image: "/placeholder.svg?height=200&width=200",
    price: 2800000,
    salePrice: 2520000,
    variantId: "v2",
    volume: "100ml",
    isNew: false,
    isBestSeller: true,
  },
  {
    id: "p3",
    name: "Yves Saint Laurent Black Opium",
    slug: "ysl-black-opium",
    brand: "YSL",
    image: "/placeholder.svg?height=200&width=200",
    price: 2500000,
    salePrice: null,
    variantId: "v3",
    volume: "90ml",
    isNew: false,
    isBestSeller: false,
  },
  {
    id: "p4",
    name: "Versace Eros",
    slug: "versace-eros",
    brand: "Versace",
    image: "/placeholder.svg?height=200&width=200",
    price: 1800000,
    salePrice: 1620000,
    variantId: "v4",
    volume: "100ml",
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "p5",
    name: "Jo Malone Wood Sage & Sea Salt",
    slug: "jo-malone-wood-sage-sea-salt",
    brand: "Jo Malone",
    image: "/placeholder.svg?height=200&width=200",
    price: 3500000,
    salePrice: null,
    variantId: "v5",
    volume: "100ml",
    isNew: false,
    isBestSeller: false,
  },
]

export function ProductSuggestions() {
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const { addItem } = useCart()
  const { addItem: addToWishlist } = useWishlist()
  const { toast } = useToast()
  const itemsPerPage = 3
  const totalPages = Math.ceil(suggestedProducts.length / itemsPerPage)

  // Giả lập loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1))
  }

  const visibleProducts = suggestedProducts.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage)

  const handleAddToCart = (product: (typeof suggestedProducts)[0]) => {
    addItem({
      productId: product.id,
      variantId: product.variantId,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      image: product.image,
      price: product.price,
      salePrice: product.salePrice,
      volume: product.volume,
      quantity: 1,
    })
    toast({
      title: "Thêm vào giỏ hàng thành công",
      description: `${product.name} đã được thêm vào giỏ hàng.`,
    })
  }

  const handleAddToWishlist = (product: (typeof suggestedProducts)[0]) => {
    addToWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      image: product.image,
      price: product.price,
      salePrice: product.salePrice,
    })
    toast({
      title: "Đã thêm vào danh sách yêu thích",
      description: `${product.name} đã được thêm vào danh sách yêu thích.`,
    })
  }

  if (isLoading) {
    return (
      <div className="mt-8 rounded-lg border p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <Skeleton className="mx-auto mb-3 h-40 w-40 rounded-md" />
              <Skeleton className="mb-2 h-5 w-3/4" />
              <Skeleton className="mb-2 h-4 w-1/2" />
              <Skeleton className="mb-4 h-5 w-1/3" />
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 rounded-lg border p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Có thể bạn cũng thích</h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrev} disabled={totalPages <= 1}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Trước</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNext} disabled={totalPages <= 1}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Sau</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {visibleProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group rounded-lg border p-4 transition-all hover:border-primary/50 hover:shadow-sm"
          >
            <div className="relative mb-3">
              <Link href={`/san-pham/${product.slug}`}>
                <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-md">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              </Link>
              <div className="absolute left-0 top-0 flex flex-col gap-1 p-2">
                {product.isNew && (
                  <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                    Mới
                  </Badge>
                )}
                {product.isBestSeller && (
                  <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                    Bán chạy
                  </Badge>
                )}
                {product.salePrice && (
                  <Badge variant="default" className="bg-red-500 hover:bg-red-600">
                    Giảm {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                  </Badge>
                )}
              </div>
            </div>
            <Link href={`/san-pham/${product.slug}`} className="block">
              <h3 className="mb-1 line-clamp-2 font-medium hover:text-primary">{product.name}</h3>
            </Link>
            <p className="mb-2 text-sm text-muted-foreground">
              {product.brand} - {product.volume}
            </p>
            <div className="mb-3 flex items-center gap-2">
              <span className="font-medium">{formatCurrency(product.salePrice || product.price)}</span>
              {product.salePrice && (
                <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.price)}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="default" size="sm" className="flex-1 gap-1" onClick={() => handleAddToCart(product)}>
                <ShoppingCart className="h-4 w-4" />
                <span>Thêm vào giỏ</span>
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleAddToWishlist(product)}>
                <Heart className="h-4 w-4" />
                <span className="sr-only">Thêm vào yêu thích</span>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

