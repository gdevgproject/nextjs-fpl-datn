"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { ProductSearch } from "@/components/san-pham/product-search"
import { ProductCompareTable } from "@/components/san-pham/product-compare-table"
import { ProductCompareFeatures } from "@/components/san-pham/product-compare-features"
import { X, ShoppingCart, Search, Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Dữ liệu mẫu cho sản phẩm so sánh
const initialProducts = [
  {
    id: 1,
    name: "Dior Sauvage EDP",
    slug: "dior-sauvage-edp",
    brand: "Dior",
    brandSlug: "dior",
    image: "/placeholder.svg?height=200&width=200",
    price: 2500000,
    salePrice: null,
    rating: 4.8,
    specifications: {
      concentration: "Eau de Parfum (EDP)",
      releaseYear: 2015,
      gender: "Nam",
      style: "Mạnh mẽ, Nam tính, Thanh lịch",
      sillage: "Tốt - Tỏa hương vừa phải",
      longevity: "Rất lâu (> 12 giờ)",
      topNotes: ["Cam Bergamot", "Tiêu", "Hoa Oải Hương"],
      middleNotes: ["Tiêu Sichuan", "Hoa Oải Hương", "Đậu Tonka"],
      baseNotes: ["Hương Gỗ", "Hương Thuốc Lá", "Ambroxan"],
    },
    variants: [
      { volume: 60, price: 2000000, salePrice: null },
      { volume: 100, price: 2500000, salePrice: null },
      { volume: 200, price: 3500000, salePrice: null },
    ],
  },
  {
    id: 2,
    name: "Chanel Bleu de Chanel EDP",
    slug: "chanel-bleu-de-chanel-edp",
    brand: "Chanel",
    brandSlug: "chanel",
    image: "/placeholder.svg?height=200&width=200",
    price: 2900000,
    salePrice: null,
    rating: 4.9,
    specifications: {
      concentration: "Eau de Parfum (EDP)",
      releaseYear: 2014,
      gender: "Nam",
      style: "Hiện đại, Thanh lịch, Tinh tế",
      sillage: "Trung bình - Tỏa hương vừa phải",
      longevity: "Lâu (8-12 giờ)",
      topNotes: ["Bạch đậu khấu", "Bưởi", "Chanh vàng"],
      middleNotes: ["Gừng", "Hoa nhài", "Dưa gang"],
      baseNotes: ["Gỗ đàn hương", "Hổ phách", "Nhang"],
    },
    variants: [
      { volume: 50, price: 2300000, salePrice: null },
      { volume: 100, price: 2900000, salePrice: null },
      { volume: 150, price: 3800000, salePrice: null },
    ],
  },
]

export function ProductCompare() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  // Lấy danh sách ID sản phẩm từ URL
  const productIds = searchParams.get("ids")?.split(",").map(Number) || []

  const [products, setProducts] = useState<any[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [productToRemove, setProductToRemove] = useState<number | null>(null)
  const [activeFeature, setActiveFeature] = useState<string | null>(null)

  // Giả lập tải dữ liệu sản phẩm từ ID
  useEffect(() => {
    // Nếu có ID trong URL, lấy sản phẩm từ dữ liệu mẫu
    if (productIds.length > 0) {
      const productsFromIds = initialProducts.filter((p) => productIds.includes(p.id))
      setProducts(productsFromIds)
    } else {
      // Nếu không có ID, sử dụng dữ liệu mẫu
      setProducts(initialProducts)
    }
  }, [productIds])

  // Cập nhật URL khi danh sách sản phẩm thay đổi
  useEffect(() => {
    if (products.length > 0) {
      const ids = products.map((p) => p.id).join(",")
      const params = new URLSearchParams(searchParams.toString())
      params.set("ids", ids)
      router.replace(`/san-pham/so-sanh?${params.toString()}`, { scroll: false })
    } else {
      router.replace("/san-pham/so-sanh", { scroll: false })
    }
  }, [products, router, searchParams])

  const handleRemoveProduct = (productId: number) => {
    if (products.length <= 2) {
      setProductToRemove(productId)
      setIsAlertOpen(true)
    } else {
      removeProduct(productId)
    }
  }

  const removeProduct = (productId: number) => {
    setProducts(products.filter((product) => product.id !== productId))
  }

  const handleAddProduct = (product: any) => {
    if (products.length >= 4) {
      toast({
        title: "Số lượng tối đa",
        description: "Bạn chỉ có thể so sánh tối đa 4 sản phẩm!",
        variant: "destructive",
      })
      return
    }

    if (products.some((p) => p.id === product.id)) {
      toast({
        title: "Sản phẩm đã tồn tại",
        description: "Sản phẩm này đã được thêm vào danh sách so sánh!",
      })
      return
    }

    setProducts([...products, product])
    setIsSearchOpen(false)
  }

  const handleFeatureClick = (feature: string) => {
    setActiveFeature(activeFeature === feature ? null : feature)
  }

  return (
    <div className="flex flex-col space-y-6">
      {products.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <div className="max-w-md mx-auto">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">Chưa có sản phẩm nào để so sánh</h2>
            <p className="text-muted-foreground mb-6">
              Thêm sản phẩm vào danh sách so sánh để xem sự khác biệt và tìm ra sản phẩm phù hợp nhất với bạn.
            </p>
            <Button onClick={() => setIsSearchOpen(true)}>Thêm sản phẩm để so sánh</Button>
          </div>
        </div>
      ) : (
        <>
          {/* Product Cards */}
          <div className="relative">
            {!isDesktop && (
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-medium">Sản phẩm so sánh ({products.length}/4)</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSearchOpen(true)}
                  disabled={products.length >= 4}
                >
                  + Thêm sản phẩm
                </Button>
              </div>
            )}

            <ScrollArea className="pb-4">
              <div className={`grid grid-cols-${products.length} gap-4 min-w-[640px]`}>
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => handleRemoveProduct(product.id)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>

                    <div className="flex flex-col items-center text-center">
                      <div className="relative h-40 w-40 mb-4">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-contain"
                        />
                      </div>

                      <Link href={`/san-pham/${product.slug}`} className="font-medium hover:underline">
                        {product.name}
                      </Link>

                      <Link
                        href={`/thuong-hieu/${product.brandSlug}`}
                        className="text-sm text-muted-foreground hover:underline"
                      >
                        {product.brand}
                      </Link>

                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500 mr-1" />
                        <span className="text-sm">{product.rating}</span>
                      </div>

                      <div className="mt-2">
                        {product.salePrice ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{formatCurrency(product.salePrice)}</span>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold">{formatCurrency(product.price)}</span>
                        )}
                      </div>

                      <Button className="mt-4 w-full" size="sm">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Thêm vào giỏ
                      </Button>
                    </div>
                  </div>
                ))}

                {products.length < 4 && isDesktop && (
                  <div
                    className="border rounded-lg p-4 flex flex-col items-center justify-center min-h-[300px] cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="font-medium">Thêm sản phẩm</p>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Thêm sản phẩm để so sánh
                      <br />
                      (tối đa 4 sản phẩm)
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Feature Highlights */}
          <ProductCompareFeatures
            products={products}
            activeFeature={activeFeature}
            onFeatureClick={handleFeatureClick}
          />

          {/* Comparison Table */}
          <ProductCompareTable products={products} activeFeature={activeFeature} />
        </>
      )}

      {/* Product Search Modal */}
      {isSearchOpen && (
        <ProductSearch
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={handleAddProduct}
          excludeIds={products.map((p) => p.id)}
        />
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm khỏi so sánh?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn cần ít nhất 2 sản phẩm để so sánh. Nếu xóa sản phẩm này, bạn có muốn thêm sản phẩm khác thay thế
              không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (productToRemove !== null) {
                  removeProduct(productToRemove)
                  setProductToRemove(null)
                  setIsSearchOpen(true)
                }
              }}
            >
              Xóa và thêm sản phẩm khác
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

