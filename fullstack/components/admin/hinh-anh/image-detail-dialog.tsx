"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ImageDetailDialogProps {
  image: {
    id: string
    product_id: string
    product_name: string
    image_url: string
    alt_text: string
    display_order: number
    is_main: boolean
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageDetailDialog({ image, open, onOpenChange }: ImageDetailDialogProps) {
  const [altText, setAltText] = useState(image.alt_text)
  const [displayOrder, setDisplayOrder] = useState(image.display_order.toString())
  const [isMain, setIsMain] = useState(image.is_main)

  // Giả lập các phiên bản hình ảnh
  const imageSizes = {
    original: image.image_url,
    large: image.image_url,
    medium: image.image_url,
    thumbnail: image.image_url,
  }

  const handleSave = () => {
    // Xử lý lưu thông tin hình ảnh (sẽ được thêm sau)
    console.log({
      id: image.id,
      altText,
      displayOrder: Number.parseInt(displayOrder),
      isMain,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chi tiết hình ảnh</DialogTitle>
          <DialogDescription>Xem và chỉnh sửa thông tin hình ảnh cho sản phẩm {image.product_name}.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Tabs defaultValue="original" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="original">Gốc</TabsTrigger>
              <TabsTrigger value="large">Lớn</TabsTrigger>
              <TabsTrigger value="medium">Vừa</TabsTrigger>
              <TabsTrigger value="thumbnail">Nhỏ</TabsTrigger>
            </TabsList>
            <TabsContent value="original" className="mt-4">
              <div className="mx-auto max-w-[400px]">
                <Image
                  src={imageSizes.original || "/placeholder.svg"}
                  alt={image.alt_text || "Product image"}
                  width={400}
                  height={400}
                  className="rounded-md object-contain"
                />
                <p className="mt-2 text-center text-sm text-muted-foreground">Kích thước gốc</p>
              </div>
            </TabsContent>
            <TabsContent value="large" className="mt-4">
              <div className="mx-auto max-w-[400px]">
                <Image
                  src={imageSizes.large || "/placeholder.svg"}
                  alt={image.alt_text || "Product image"}
                  width={400}
                  height={400}
                  className="rounded-md object-contain"
                />
                <p className="mt-2 text-center text-sm text-muted-foreground">Kích thước lớn (800x800px)</p>
              </div>
            </TabsContent>
            <TabsContent value="medium" className="mt-4">
              <div className="mx-auto max-w-[300px]">
                <Image
                  src={imageSizes.medium || "/placeholder.svg"}
                  alt={image.alt_text || "Product image"}
                  width={300}
                  height={300}
                  className="rounded-md object-contain"
                />
                <p className="mt-2 text-center text-sm text-muted-foreground">Kích thước vừa (400x400px)</p>
              </div>
            </TabsContent>
            <TabsContent value="thumbnail" className="mt-4">
              <div className="mx-auto max-w-[200px]">
                <Image
                  src={imageSizes.thumbnail || "/placeholder.svg"}
                  alt={image.alt_text || "Product image"}
                  width={200}
                  height={200}
                  className="rounded-md object-contain"
                />
                <p className="mt-2 text-center text-sm text-muted-foreground">Kích thước nhỏ (200x200px)</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="product">Sản phẩm</Label>
            <Input id="product" value={image.product_name} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alt-text">Alt Text (cho SEO)</Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Mô tả hình ảnh"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display-order">Thứ tự hiển thị</Label>
              <Input
                id="display-order"
                type="number"
                min="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox id="is-main" checked={isMain} onCheckedChange={(checked) => setIsMain(checked === true)} />
                <Label htmlFor="is-main">Đặt làm ảnh chính</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

