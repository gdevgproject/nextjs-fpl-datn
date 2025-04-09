"use client"

import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { EnhancedImageUpload } from "@/components/admin/hinh-anh/enhanced-image-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Search, Filter, SlidersHorizontal } from "lucide-react"

interface ImageFile {
  id: string
  file: File
  preview: string
  alt_text: string
  is_main: boolean
  display_order: number
  upload_progress?: number
}

export function ImageManager() {
  const [activeTab, setActiveTab] = useState("upload")
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<{ id: string; name: string }[]>([])
  const isMobile = useMediaQuery("(max-width: 640px)")
  const { toast } = useToast()

  // Simulate loading products
  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts([
        { id: "1", name: "Chanel No. 5" },
        { id: "2", name: "Dior Sauvage" },
        { id: "3", name: "Gucci Bloom" },
        { id: "4", name: "Versace Eros" },
        { id: "5", name: "Calvin Klein CK One" },
      ])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Sample existing images for demo purposes
  const sampleExistingImages = [
    {
      id: "1",
      image_url: "/placeholder.svg?height=400&width=400",
      alt_text: "Chanel No. 5 Bottle",
      display_order: 1,
      is_main: true,
    },
    {
      id: "2",
      image_url: "/placeholder.svg?height=400&width=400",
      alt_text: "Chanel No. 5 Box",
      display_order: 2,
      is_main: false,
    },
  ]

  const handleImagesSubmit = (images: ImageFile[]) => {
    // This would normally send the images to the server
    console.log("Submitting images:", images)

    // Show success toast
    toast({
      title: "Tải lên thành công",
      description: `Đã tải lên ${images.length} hình ảnh thành công.`,
    })
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Tải lên hình ảnh</TabsTrigger>
          <TabsTrigger value="manage">Quản lý hình ảnh</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tải lên hình ảnh sản phẩm</CardTitle>
              <CardDescription>Chọn sản phẩm và tải lên hình ảnh cho sản phẩm đó.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="product">Sản phẩm</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct} disabled={isLoading}>
                  <SelectTrigger>
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
              </div>

              <EnhancedImageUpload
                existingImages={selectedProduct === "1" ? sampleExistingImages : []}
                onSubmit={handleImagesSubmit}
                disabled={!selectedProduct}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý hình ảnh sản phẩm</CardTitle>
              <CardDescription>Tìm kiếm và quản lý hình ảnh cho các sản phẩm.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="oldest">Cũ nhất</SelectItem>
                    <SelectItem value="name_asc">Tên A-Z</SelectItem>
                    <SelectItem value="name_desc">Tên Z-A</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Lọc
                </Button>
              </div>

              <div className="rounded-md border p-8 text-center">
                <SlidersHorizontal className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">Chọn bộ lọc</h3>
                <p className="mt-1 text-sm text-muted-foreground">Sử dụng bộ lọc để tìm kiếm hình ảnh sản phẩm.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

