"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface ImageUploadProps {
  products: { id: string; name: string }[]
}

export function ImageUpload({ products }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [altText, setAltText] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [isMain, setIsMain] = useState(false)
  const [displayOrder, setDisplayOrder] = useState("1")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreview(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Xử lý upload hình ảnh (sẽ được thêm sau)
    console.log({
      file: selectedFile,
      altText,
      productId: selectedProduct,
      isMain,
      displayOrder: Number.parseInt(displayOrder),
    })

    // Reset form
    setSelectedFile(null)
    setPreview(null)
    setAltText("")
    setIsMain(false)
    setDisplayOrder("1")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="product">Sản phẩm</Label>
        <Select value={selectedProduct} onValueChange={setSelectedProduct} required>
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

      <div className="space-y-2">
        <Label htmlFor="image">Hình ảnh</Label>
        {!preview ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400">
            <Upload className="mb-2 h-8 w-8 text-gray-400" />
            <p className="mb-1 text-sm font-medium">Kéo thả hoặc nhấp để tải lên</p>
            <p className="text-xs text-gray-500">SVG, PNG, JPG hoặc GIF (Tối đa 5MB)</p>
            <Input
              id="image"
              type="file"
              className="mt-4 w-full"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>
        ) : (
          <Card className="relative overflow-hidden">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 z-10 h-6 w-6"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardContent className="p-2">
              <Image
                src={preview || "/placeholder.svg"}
                alt="Preview"
                width={300}
                height={300}
                className="mx-auto h-[200px] w-full rounded-md object-contain"
              />
            </CardContent>
          </Card>
        )}
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

      <Button type="submit" className="w-full" disabled={!selectedFile || !selectedProduct}>
        Tải lên
      </Button>
    </form>
  )
}

