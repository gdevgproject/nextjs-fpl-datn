"use client"

import { useState } from "react"
import Image from "next/image"
import { Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ProductPreviewProps {
  product: {
    name: string
    product_code: string
    short_description?: string
    long_description?: string
    brand?: { id: string; name: string }
    gender?: { id: string; name: string }
    perfume_type?: { id: string; name: string }
    concentration?: { id: string; name: string }
    origin_country?: string
    release_year?: number
    style?: string
    sillage?: string
    longevity?: string
    categories?: { id: string; name: string }[]
    images?: { id: string; url: string; alt_text?: string; is_main?: boolean }[]
    variants?: { id: string; volume_ml: number; price: number; sale_price?: number; stock_quantity: number }[]
    scents?: { id: string; name; price: number; sale_price?: number; stock_quantity: number }[]
    scents?: { id: string; name: string; type: string }[]
    ingredients?: { id: string; name: string }[]
    status?: "active" | "out_of_stock" | "deleted"
  }
}

export function ProductFormPreview({ product }: ProductPreviewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState("info")
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Lấy hình ảnh chính hoặc hình đầu tiên
  const mainImage = product.images?.find((img) => img.is_main) || product.images?.[0]

  // Lấy danh sách hình ảnh
  const images = product.images || []

  // Chuyển đến hình ảnh trước
  const prevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  // Chuyển đến hình ảnh tiếp theo
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // Hiển thị thông tin cơ bản
  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Mã sản phẩm</h3>
          <p>{product.product_code || "Chưa có"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Thương hiệu</h3>
          <p>{product.brand?.name || "Chưa chọn"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Giới tính</h3>
          <p>{product.gender?.name || "Chưa chọn"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Loại nước hoa</h3>
          <p>{product.perfume_type?.name || "Chưa chọn"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Nồng độ</h3>
          <p>{product.concentration?.name || "Chưa chọn"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Xuất xứ</h3>
          <p>{product.origin_country || "Chưa có"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Năm phát hành</h3>
          <p>{product.release_year || "Chưa có"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Phong cách</h3>
          <p>{product.style || "Chưa có"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Độ tỏa hương</h3>
          <p>{product.sillage || "Chưa có"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Độ lưu hương</h3>
          <p>{product.longevity || "Chưa có"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Trạng thái</h3>
          <p>
            {product.status === "active" && <Badge variant="success">Đang bán</Badge>}
            {product.status === "out_of_stock" && <Badge variant="warning">Hết hàng</Badge>}
            {product.status === "deleted" && <Badge variant="destructive">Đã xóa</Badge>}
            {!product.status && <span className="text-muted-foreground">Chưa đặt</span>}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Mô tả ngắn</h3>
        <p className="whitespace-pre-line">{product.short_description || "Chưa có mô tả ngắn"}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Mô tả chi tiết</h3>
        <div className="max-h-40 overflow-y-auto">
          <p className="whitespace-pre-line">{product.long_description || "Chưa có mô tả chi tiết"}</p>
        </div>
      </div>
    </div>
  )

  // Hiển thị danh mục
  const renderCategories = () => (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Danh mục sản phẩm</h3>
      {product.categories && product.categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {product.categories.map((category) => (
            <Badge key={category.id} variant="outline">
              {category.name}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Chưa chọn danh mục</p>
      )}
    </div>
  )

  // Hiển thị biến thể
  const renderVariants = () => (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Biến thể sản phẩm</h3>
      {product.variants && product.variants.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dung tích (ml)</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead>Giá khuyến mãi</TableHead>
              <TableHead>Tồn kho</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {product.variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>{variant.volume_ml}</TableCell>
                <TableCell>{variant.price.toLocaleString("vi-VN")}₫</TableCell>
                <TableCell>{variant.sale_price ? `${variant.sale_price.toLocaleString("vi-VN")}₫` : "-"}</TableCell>
                <TableCell>{variant.stock_quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-muted-foreground">Chưa có biến thể</p>
      )}
    </div>
  )

  // Hiển thị hương thơm
  const renderScents = () => (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Hương thơm</h3>
      {product.scents && product.scents.length > 0 ? (
        <div className="space-y-4">
          {["top", "middle", "base"].map((type) => {
            const typeScents = product.scents?.filter((scent) => scent.type === type)
            return (
              <div key={type}>
                <h4 className="text-xs font-medium uppercase">
                  {type === "top" && "Hương đầu"}
                  {type === "middle" && "Hương giữa"}
                  {type === "base" && "Hương cuối"}
                </h4>
                {typeScents && typeScents.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {typeScents.map((scent) => (
                      <Badge key={scent.id} variant="secondary">
                        {scent.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Chưa có</p>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">Chưa có thông tin hương thơm</p>
      )}
    </div>
  )

  // Hiển thị thành phần
  const renderIngredients = () => (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Thành phần</h3>
      {product.ingredients && product.ingredients.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {product.ingredients.map((ingredient) => (
            <Badge key={ingredient.id} variant="outline">
              {ingredient.name}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">Chưa có thông tin thành phần</p>
      )}
    </div>
  )

  // Hiển thị hình ảnh
  const renderImages = () => (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-md border">
        {images.length > 0 ? (
          <>
            <Image
              src={images[activeImageIndex].url || "/placeholder.svg"}
              alt={images[activeImageIndex].alt_text || product.name}
              fill
              className="object-cover"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <p className="text-muted-foreground">Chưa có hình ảnh</p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              className={`relative h-16 w-16 overflow-hidden rounded-md border ${
                index === activeImageIndex ? "ring-2 ring-primary" : ""
              } ${image.is_main ? "ring-1 ring-amber-500" : ""}`}
              onClick={() => setActiveImageIndex(index)}
            >
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.alt_text || `Hình ${index + 1}`}
                fill
                className="object-cover"
              />
              {image.is_main && (
                <div className="absolute bottom-0 left-0 right-0 bg-amber-500 text-[10px] text-white text-center">
                  Chính
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  // Nội dung xem trước
  const previewContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>{renderImages()}</div>
        <div>
          <h2 className="text-xl font-bold">{product.name || "Tên sản phẩm"}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {product.product_code ? `Mã: ${product.product_code}` : "Chưa có mã sản phẩm"}
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">
                Thông tin
              </TabsTrigger>
              <TabsTrigger value="variants" className="flex-1">
                Biến thể
              </TabsTrigger>
              <TabsTrigger value="scents" className="flex-1">
                Hương thơm
              </TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="space-y-4 pt-4">
              {renderBasicInfo()}
              <Separator />
              {renderCategories()}
              <Separator />
              {renderIngredients()}
            </TabsContent>
            <TabsContent value="variants" className="pt-4">
              {renderVariants()}
            </TabsContent>
            <TabsContent value="scents" className="pt-4">
              {renderScents()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )

  // Hiển thị trên desktop
  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Eye className="mr-2 h-4 w-4" />
            Xem trước sản phẩm
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Xem trước sản phẩm</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-80px)]">
            <div className="p-4">{previewContent}</div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    )
  }

  // Hiển thị trên mobile và tablet
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full">
          <Eye className="mr-2 h-4 w-4" />
          Xem trước sản phẩm
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Xem trước sản phẩm</DrawerTitle>
        </DrawerHeader>
        <ScrollArea className="h-[70vh]">
          <div className="px-4 pb-8">{previewContent}</div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

