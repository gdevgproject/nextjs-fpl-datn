"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Upload, X, Crop, ZoomIn, ZoomOut, RotateCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

export function ShopLogoUpload() {
  const [logo, setLogo] = useState<string>("/placeholder.svg?height=200&width=400")
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("preview")
  const { toast } = useToast()

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Kiểm tra kích thước file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Lỗi tải lên",
        description: "Kích thước file không được vượt quá 2MB",
      })
      return
    }

    // Giả lập upload
    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setTimeout(() => {
        setLogo(reader.result as string)
        setIsUploading(false)
        setActiveTab("edit")
        toast({
          title: "Tải lên thành công",
          description: "Logo đã được tải lên, bạn có thể chỉnh sửa trước khi lưu",
        })
      }, 1000)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogo("/placeholder.svg?height=200&width=400")
    setActiveTab("preview")
    toast({
      title: "Đã xóa logo",
      description: "Logo đã được đặt về mặc định",
    })
  }

  const handleSaveLogo = () => {
    setActiveTab("preview")
    toast({
      title: "Đã lưu logo",
      description: "Logo đã được cập nhật thành công",
    })
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">Xem trước</TabsTrigger>
          <TabsTrigger value="edit" disabled={logo === "/placeholder.svg?height=200&width=400"}>
            Chỉnh sửa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-4">
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center p-6">
              <div className="relative w-full max-w-md">
                <Image
                  src={logo || "/placeholder.svg"}
                  alt="Logo cửa hàng"
                  width={400}
                  height={200}
                  className="h-auto w-full object-contain"
                />
                {logo !== "/placeholder.svg?height=200&width=400" && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-8 w-8 rounded-full"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-center bg-muted/30 rounded-md p-4">
                <Image
                  src={logo || "/placeholder.svg"}
                  alt="Logo cửa hàng"
                  width={400}
                  height={200}
                  className="h-auto max-w-full object-contain"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Crop className="h-4 w-4 mr-2" />
                  Cắt
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <ZoomIn className="h-4 w-4 mr-2" />
                  Phóng to
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <ZoomOut className="h-4 w-4 mr-2" />
                  Thu nhỏ
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <RotateCw className="h-4 w-4 mr-2" />
                  Xoay
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Độ sáng</span>
                  <span className="text-sm">50%</span>
                </div>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Độ tương phản</span>
                  <span className="text-sm">50%</span>
                </div>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActiveTab("preview")}>
                  Hủy
                </Button>
                <Button onClick={handleSaveLogo}>Lưu thay đổi</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="outline" disabled={isUploading} className="w-full sm:w-auto">
          <label className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Đang tải lên..." : "Tải lên logo mới"}
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploading} />
          </label>
        </Button>
        <Button
          variant="outline"
          onClick={handleRemoveLogo}
          disabled={logo === "/placeholder.svg?height=200&width=400" || isUploading}
          className="w-full sm:w-auto"
        >
          Xóa logo
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Định dạng hỗ trợ: PNG, JPG, GIF. Kích thước tối đa: 2MB.</p>
    </div>
  )
}

