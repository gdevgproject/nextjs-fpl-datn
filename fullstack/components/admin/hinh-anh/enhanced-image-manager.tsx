"use client"

import { useState, useEffect } from "react"
import { ImageGrid } from "@/components/admin/hinh-anh/image-grid"
import { EnhancedImageUpload } from "@/components/admin/hinh-anh/enhanced-image-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Search, Filter, Upload, ImageIcon, RefreshCw, ImagePlus, X } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

// Type definitions based on the database schema
interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  is_main: boolean
  display_order: number
}

interface Product {
  id: string
  name: string
  thumbnail?: string
}

interface EnhancedImageManagerProps {
  productId?: string
  productName?: string
}

export function EnhancedImageManager({ productId, productName }: EnhancedImageManagerProps) {
  const [activeTab, setActiveTab] = useState("manage")
  const [selectedProduct, setSelectedProduct] = useState<string>(productId || "")
  const [searchQuery, setSearchQuery] = useState("")
  const [showOnlyMissing, setShowOnlyMissing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [filteredImages, setFilteredImages] = useState<ProductImage[]>([])
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const { toast } = useToast()

  // If a productId is provided, we're in the context of a specific product
  const isProductContext = !!productId

  // Simulate loading products
  useEffect(() => {
    // Only load products if we're not in a product context
    if (!isProductContext) {
      const timer = setTimeout(() => {
        setProducts([
          { id: "1", name: "Chanel No. 5", thumbnail: "/placeholder.svg?height=400&width=400" },
          { id: "2", name: "Dior Sauvage", thumbnail: "/placeholder.svg?height=400&width=400" },
          { id: "3", name: "Gucci Bloom", thumbnail: "/placeholder.svg?height=400&width=400" },
          { id: "4", name: "Versace Eros", thumbnail: "/placeholder.svg?height=400&width=400" },
          { id: "5", name: "Calvin Klein CK One", thumbnail: "/placeholder.svg?height=400&width=400" },
        ])
        setIsLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isProductContext])

  // Simulate loading images for the selected product
  useEffect(() => {
    if (selectedProduct || productId) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        // Generate sample images based on the product ID
        const id = productId || selectedProduct

        if (id === "1") {
          // Chanel No. 5 sample images
          setImages([
            {
              id: "1",
              product_id: "1",
              image_url: "/placeholder.svg?height=400&width=400",
              alt_text: "Chanel No. 5 Parfum Bottle",
              is_main: true,
              display_order: 1,
            },
            {
              id: "2",
              product_id: "1",
              image_url: "/placeholder.svg?height=400&width=400",
              alt_text: "Chanel No. 5 Box",
              is_main: false,
              display_order: 2,
            },
            {
              id: "3",
              product_id: "1",
              image_url: "/placeholder.svg?height=400&width=400",
              alt_text: null,
              is_main: false,
              display_order: 3,
            },
          ])
        } else if (id === "2") {
          // Dior Sauvage sample images
          setImages([
            {
              id: "4",
              product_id: "2",
              image_url: "/placeholder.svg?height=400&width=400",
              alt_text: "Dior Sauvage Eau de Toilette",
              is_main: true,
              display_order: 1,
            },
            {
              id: "5",
              product_id: "2",
              image_url: "/placeholder.svg?height=400&width=400",
              alt_text: "Dior Sauvage Bottle Side View",
              is_main: false,
              display_order: 2,
            },
          ])
        } else {
          // Generic sample images for other products
          setImages([
            {
              id: "6",
              product_id: id,
              image_url: "/placeholder.svg?height=400&width=400",
              alt_text: "Product Front View",
              is_main: true,
              display_order: 1,
            },
          ])
        }

        setIsLoading(false)
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      setImages([])
    }
  }, [selectedProduct, productId])

  // Filter images based on search query and showOnlyMissing
  useEffect(() => {
    let filtered = [...images]

    if (searchQuery) {
      filtered = filtered.filter(
        (image) =>
          image.alt_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `Hình ${image.display_order}`.includes(searchQuery),
      )
    }

    if (showOnlyMissing) {
      filtered = filtered.filter((image) => !image.alt_text)
    }

    setFilteredImages(filtered)
  }, [images, searchQuery, showOnlyMissing])

  // Handle reordering images
  const handleReorder = (reorderedImages: ProductImage[]) => {
    setIsUpdating(true)

    // In a real app, this would be an API call to update the database
    setTimeout(() => {
      setImages(reorderedImages)
      setIsUpdating(false)

      toast({
        title: "Thứ tự đã được cập nhật",
        description: "Thứ tự hiển thị hình ảnh đã được cập nhật thành công.",
      })
    }, 500)
  }

  // Handle setting main image
  const handleSetMain = (imageId: string) => {
    setIsUpdating(true)

    // In a real app, this would be an API call to update the database
    setTimeout(() => {
      const updatedImages = images.map((image) => ({
        ...image,
        is_main: image.id === imageId,
      }))

      setImages(updatedImages)
      setIsUpdating(false)

      toast({
        title: "Ảnh chính đã được cập nhật",
        description: "Ảnh chính mới đã được thiết lập thành công.",
      })
    }, 500)
  }

  // Handle updating alt text
  const handleUpdateAltText = (imageId: string, altText: string) => {
    setIsUpdating(true)

    // In a real app, this would be an API call to update the database
    setTimeout(() => {
      const updatedImages = images.map((image) =>
        image.id === imageId ? { ...image, alt_text: altText || null } : image,
      )

      setImages(updatedImages)
      setIsUpdating(false)

      toast({
        title: "Alt text đã được cập nhật",
        description: "Alt text mới đã được lưu thành công.",
      })
    }, 500)
  }

  // Handle deleting an image
  const handleDelete = (imageId: string) => {
    setIsUpdating(true)

    // In a real app, this would be an API call to delete from the database
    setTimeout(() => {
      const updatedImages = images.filter((image) => image.id !== imageId)

      // If we deleted the main image, set the first remaining image as main
      if (images.find((img) => img.id === imageId)?.is_main && updatedImages.length > 0) {
        updatedImages[0].is_main = true
      }

      setImages(updatedImages)
      setIsUpdating(false)

      toast({
        title: "Hình ảnh đã được xóa",
        description: "Hình ảnh đã được xóa thành công.",
      })
    }, 500)
  }

  // Handle bulk updating alt text for all images
  const handleBulkUpdateAltText = () => {
    setIsUpdating(true)

    // In a real app, this would be an API call to update the database
    setTimeout(() => {
      const productNamePrefix = productName || products.find((p) => p.id === selectedProduct)?.name || "Sản phẩm"

      const updatedImages = images.map((image, index) => ({
        ...image,
        alt_text: `${productNamePrefix} - Hình ${index + 1}`,
      }))

      setImages(updatedImages)
      setIsUpdating(false)

      toast({
        title: "Alt text đã được cập nhật hàng loạt",
        description: "Alt text cho tất cả hình ảnh đã được cập nhật thành công.",
      })
    }, 500)
  }

  // Handle bulk delete confirmation
  const handleBulkDelete = () => {
    setIsUpdating(true)

    // In a real app, this would be an API call to delete from the database
    setTimeout(() => {
      setImages([])
      setIsUpdating(false)

      toast({
        title: "Tất cả hình ảnh đã được xóa",
        description: "Tất cả hình ảnh đã được xóa thành công.",
      })
    }, 500)
  }

  // Handle image upload submission
  const handleImagesSubmit = (uploadedImages: any[]) => {
    // This would normally send the images to the server
    console.log("Submitting images:", uploadedImages)

    // Show success toast
    toast({
      title: "Tải lên thành công",
      description: `Đã tải lên ${uploadedImages.length} hình ảnh thành công.`,
    })

    // Switch to manage tab after upload
    setActiveTab("manage")
  }

  return (
    <div className="space-y-6">
      {!isProductContext && (
        <div className="space-y-2">
          <Label htmlFor="product">Sản phẩm</Label>
          <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={isLoading}>
            <SelectTrigger id="product" className="w-full sm:w-[300px]">
              <SelectValue placeholder="Chọn sản phẩm" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedProduct && (
            <p className="text-sm text-muted-foreground">
              Đang quản lý hình ảnh cho:{" "}
              <span className="font-medium">{products.find((p) => p.id === selectedProduct)?.name}</span>
            </p>
          )}
        </div>
      )}

      {(selectedProduct || isProductContext) && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">
              <ImageIcon className="mr-2 h-4 w-4" />
              Quản lý hình ảnh
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Tải lên hình ảnh mới
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Quản lý hình ảnh sản phẩm</CardTitle>
                  <CardDescription>Xem, sắp xếp, chỉnh sửa và xóa hình ảnh cho sản phẩm.</CardDescription>
                </div>

                <div className="flex space-x-2">
                  {filteredImages.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkUpdateAltText}
                      disabled={isUpdating || filteredImages.length === 0}
                    >
                      Cập nhật alt text
                    </Button>
                  )}

                  {isMobile ? (
                    <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="mr-2 h-4 w-4" />
                          Bộ lọc
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right">
                        <SheetHeader>
                          <SheetTitle>Bộ lọc</SheetTitle>
                          <SheetDescription>Lọc hình ảnh theo các tiêu chí sau</SheetDescription>
                        </SheetHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="search-mobile">Tìm kiếm</Label>
                            <Input
                              id="search-mobile"
                              placeholder="Tìm kiếm theo alt text..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="missing-alt-mobile"
                              checked={showOnlyMissing}
                              onCheckedChange={setShowOnlyMissing}
                            />
                            <Label htmlFor="missing-alt-mobile">Chỉ hiển thị hình thiếu alt text</Label>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  ) : (
                    <div className="flex space-x-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Tìm kiếm theo alt text..."
                          className="w-[200px] pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch id="missing-alt" checked={showOnlyMissing} onCheckedChange={setShowOnlyMissing} />
                        <Label htmlFor="missing-alt" className="whitespace-nowrap">
                          Chỉ thiếu alt text
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <div className="flex h-40 items-center justify-center">
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    <span>Đang tải...</span>
                  </div>
                ) : filteredImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                    <ImageIcon className="mb-2 h-12 w-12 text-gray-400" />
                    <h3 className="mb-1 text-lg font-medium">Không có hình ảnh</h3>
                    {images.length > 0 ? (
                      <p className="text-sm text-gray-500">Không tìm thấy hình ảnh nào phù hợp với bộ lọc hiện tại.</p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Sản phẩm này chưa có hình ảnh nào. Hãy tải lên hình ảnh mới.
                      </p>
                    )}
                    <Button variant="outline" className="mt-4" onClick={() => setActiveTab("upload")}>
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Tải lên hình ảnh
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{filteredImages.length} hình ảnh</Badge>

                        {searchQuery && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Tìm kiếm: {searchQuery}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-4 w-4 p-0"
                              onClick={() => setSearchQuery("")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}

                        {showOnlyMissing && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            Chỉ thiếu alt text
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-4 w-4 p-0"
                              onClick={() => setShowOnlyMissing(false)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <ImageGrid
                      images={filteredImages}
                      onReorder={handleReorder}
                      onSetMain={handleSetMain}
                      onUpdateAltText={handleUpdateAltText}
                      onDelete={handleDelete}
                      productName={productName || products.find((p) => p.id === selectedProduct)?.name}
                      loading={isUpdating}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tải lên hình ảnh mới</CardTitle>
                <CardDescription>Chọn nhiều hình ảnh để tải lên cho sản phẩm.</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedImageUpload productId={productId || selectedProduct} onSubmit={handleImagesSubmit} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

