"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Upload, X, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ShopFaviconUpload() {
  const [favicon, setFavicon] = useState<string>("/placeholder.svg?height=64&width=64")
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const { toast } = useToast()

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Kiểm tra loại file
    if (!file.type.includes("image")) {
      toast({
        variant: "destructive",
        title: "Lỗi tải lên",
        description: "Vui lòng chọn file hình ảnh",
      })
      return
    }

    // Kiểm tra kích thước file (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Lỗi tải lên",
        description: "Kích thước file không được vượt quá 1MB",
      })
      return
    }

    // Giả lập upload
    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setTimeout(() => {
        setFavicon(reader.result as string)
        setIsUploading(false)
        toast({
          title: "Tải lên thành công",
          description: "Favicon đã được cập nhật",
        })
      }, 1000)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveFavicon = () => {
    setFavicon("/placeholder.svg?height=64&width=64")
    toast({
      title: "Đã xóa favicon",
      description: "Favicon đã được đặt về mặc định",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="border-dashed md:w-1/3">
          <CardContent className="flex items-center justify-center p-6">
            <div className="relative">
              <Image
                src={favicon || "/placeholder.svg"}
                alt="Favicon cửa hàng"
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
              />
              {favicon !== "/placeholder.svg?height=64&width=64" && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                  onClick={handleRemoveFavicon}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="md:w-2/3 space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lưu ý</AlertTitle>
            <AlertDescription>
              Favicon nên có kích thước vuông (ví dụ: 32x32px, 64x64px) và định dạng PNG hoặc ICO để hiển thị tốt nhất
              trên các trình duyệt.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline" disabled={isUploading} className="w-full sm:w-auto">
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Đang tải lên..." : "Tải lên favicon mới"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFaviconUpload}
                  disabled={isUploading}
                />
              </label>
            </Button>
            <Button
              variant="outline"
              onClick={handleRemoveFavicon}
              disabled={favicon === "/placeholder.svg?height=64&width=64" || isUploading}
              className="w-full sm:w-auto"
            >
              Xóa favicon
            </Button>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Định dạng hỗ trợ: PNG, ICO. Kích thước tối đa: 1MB. Kích thước khuyến nghị: 32x32px hoặc 64x64px.
      </p>
    </div>
  )
}

