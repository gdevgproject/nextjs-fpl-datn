"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, Plus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ImageBulkUploadProps {
  products: { id: string; name: string }[]
}

export function ImageBulkUpload({ products }: ImageBulkUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    setSelectedFiles([...selectedFiles, ...newFiles])

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setPreviews([...previews, ...newPreviews])
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = [...selectedFiles]
    newFiles.splice(index, 1)
    setSelectedFiles(newFiles)

    const newPreviews = [...previews]
    URL.revokeObjectURL(newPreviews[index])
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Xử lý upload nhiều hình ảnh (sẽ được thêm sau)
    console.log({
      files: selectedFiles,
      productId: selectedProduct,
    })

    // Reset form
    previews.forEach(URL.revokeObjectURL)
    setSelectedFiles([])
    setPreviews([])
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
        <Label>Hình ảnh ({selectedFiles.length})</Label>
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-gray-400">
          <Upload className="mb-2 h-6 w-6 text-gray-400" />
          <p className="mb-1 text-sm font-medium">Kéo thả hoặc nhấp để tải lên nhiều hình ảnh</p>
          <p className="text-xs text-gray-500">SVG, PNG, JPG hoặc GIF (Tối đa 5MB mỗi ảnh)</p>
          <Input
            id="bulk-images"
            type="file"
            className="mt-4 w-full"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </div>
      </div>

      {previews.length > 0 && (
        <div className="space-y-2">
          <Label>Xem trước ({previews.length} hình ảnh)</Label>
          <ScrollArea className="h-[200px] rounded-md border">
            <div className="grid grid-cols-3 gap-2 p-2">
              {previews.map((preview, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1 z-10 h-5 w-5"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <CardContent className="p-1">
                    <Image
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      width={100}
                      height={100}
                      className="h-[80px] w-full rounded-md object-cover"
                    />
                  </CardContent>
                </Card>
              ))}
              <label htmlFor="add-more-images" className="cursor-pointer">
                <div className="flex h-[98px] w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 hover:border-gray-400">
                  <Plus className="h-5 w-5 text-gray-400" />
                  <span className="mt-1 text-xs text-gray-500">Thêm</span>
                </div>
                <Input
                  id="add-more-images"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </ScrollArea>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={selectedFiles.length === 0 || !selectedProduct}>
        Tải lên {selectedFiles.length} hình ảnh
      </Button>
    </form>
  )
}

