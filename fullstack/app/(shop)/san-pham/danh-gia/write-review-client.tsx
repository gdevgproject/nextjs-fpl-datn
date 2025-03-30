"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { EnhancedReviewForm } from "@/components/danh-gia/enhanced-review-form"
import { ProductNotFound } from "@/components/danh-gia/product-not-found"
import { PurchaseRequired } from "@/components/danh-gia/purchase-required"
import { ReviewSubmitted } from "@/components/danh-gia/review-submitted"

interface WriteReviewClientProps {
  productId?: number
  orderId?: number
}

export function WriteReviewClient({ productId, orderId }: WriteReviewClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    // Simulate fetching product data
    const fetchData = async () => {
      setIsLoading(true)

      if (!productId) {
        setIsLoading(false)
        return
      }

      // Simulate API call
      setTimeout(() => {
        // Mock product data
        if (productId === 101) {
          setProduct({
            id: 101,
            name: "Dior Sauvage Eau de Parfum",
            brand: "Dior",
            image: "/placeholder.svg?height=200&width=200",
            price: 2850000,
            variant: "100ml",
          })

          // Simulate purchase check
          setHasPurchased(true)

          // Simulate review check
          setHasReviewed(false)
        } else {
          setProduct({
            id: productId,
            name: "Sản phẩm mẫu",
            brand: "Thương hiệu",
            image: "/placeholder.svg?height=200&width=200",
            price: 1000000,
            variant: "50ml",
          })
          setHasPurchased(true)
          setHasReviewed(false)
        }

        setIsLoading(false)
      }, 1000)
    }

    fetchData()
  }, [productId, orderId])

  const handleSubmitSuccess = () => {
    setIsSubmitted(true)

    // Redirect after 3 seconds
    setTimeout(() => {
      if (productId) {
        router.push(`/san-pham/${productId}#reviews`)
      } else {
        router.push("/tai-khoan/danh-gia")
      }
    }, 3000)
  }

  if (isLoading) {
    return null // Skeleton is handled by Suspense
  }

  if (!product) {
    return <ProductNotFound />
  }

  if (!hasPurchased) {
    return <PurchaseRequired productId={product.id} productName={product.name} />
  }

  if (hasReviewed) {
    return (
      <ReviewSubmitted
        productId={product.id}
        productName={product.name}
        message="Bạn đã đánh giá sản phẩm này trước đó"
      />
    )
  }

  if (isSubmitted) {
    return (
      <ReviewSubmitted
        productId={product.id}
        productName={product.name}
        message="Cảm ơn bạn đã đánh giá sản phẩm. Đánh giá của bạn đang chờ duyệt."
      />
    )
  }

  return <EnhancedReviewForm product={product} onSubmitSuccess={handleSubmitSuccess} />
}

