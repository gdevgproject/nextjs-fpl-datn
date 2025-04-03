"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X, Edit2, ZoomIn, ZoomOut, RotateCw, Check, Camera } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useToast } from "@/hooks/use-toast"

interface BannerImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export function BannerImageUpload({ value, onChange }: BannerImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const { toast } = useToast()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Kiểm tra kích thước file
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File quá lớn",
        description: "Kích thước file không được vượt quá 5MB",
        variant: "destructive",
      })
      return
    }

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Loại file không hợp lệ",
        description: "Vui lòng chọn file hình ảnh",
        variant: "destructive",
      })
      return
    }

    // Tạo URL cho file
    const url = URL.createObjectURL(file)
    setEditingImage(url)
    setIsEditing(true)
  }

  const handleRemove = () => {
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleCaptureImage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // Xử lý stream để chụp ảnh
      // Đây là phần giả lập, trong thực tế sẽ cần thêm logic để chụp ảnh từ camera
      const mockCapturedImage = "/placeholder.svg?height=400&width=1200"
      onChange(mockCapturedImage)

      // Đóng stream
      stream.getTracks().forEach((track) => track.stop())

      toast({
        title: "Chụp ảnh thành công",
        description: "Hình ảnh đã được chụp từ camera",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập",
        variant: "destructive",
      })
    }
  }

  const handleSaveEdit = () => {
    // Trong thực tế, ở đây sẽ xử lý cắt/chỉnh sửa hình ảnh
    // Đây là phần giả lập, chỉ đơn giản là áp dụng hình ảnh đang chỉnh sửa
    onChange(editingImage || "")
    setIsEditing(false)
    setZoom(1)
    setRotation(0)
    setEditingImage(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setZoom(1)
    setRotation(0)
    setEditingImage(null)
  }

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0])
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  if (isEditing && editingImage) {
    return (
      <div className="space-y-4">
        <div className="border rounded-md p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Chỉnh sửa hình ảnh</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RotateCw className="h-4 w-4 mr-1" />
                Xoay
              </Button>
              <div className="flex items-center space-x-2 flex-1">
                <ZoomOut className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[zoom]}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onValueChange={handleZoomChange}
                  className="flex-1"
                />
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="relative aspect-[3/1] overflow-hidden rounded-md border">
            <div
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: "transform 0.2s ease",
              }}
              className="w-full h-full flex items-center justify-center"
            >
              <Image src={editingImage || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" size="sm" onClick={handleCancelEdit}>
              Hủy
            </Button>
            <Button size="sm" onClick={handleSaveEdit}>
              <Check className="h-4 w-4 mr-1" />
              Áp dụng
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative rounded-md overflow-hidden border">
          <div className="aspect-[3/1] relative">
            <Image src={value || "/placeholder.svg"} alt="Banner preview" fill className="object-cover" />
          </div>
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="bg-white/80 hover:bg-white"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="bg-white/80 hover:bg-destructive"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="upload">Tải lên</TabsTrigger>
            {!isMobile && <TabsTrigger value="camera">Chụp ảnh</TabsTrigger>}
          </TabsList>
          <TabsContent value="upload" className="mt-2">
            <div
              className={`border-2 border-dashed rounded-md ${
                dragActive ? "border-primary" : "border-gray-300"
              } p-8 flex flex-col items-center justify-center text-center`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-lg font-medium">Kéo và thả hình ảnh vào đây</p>
              <p className="text-sm text-muted-foreground mb-4">Hoặc click để chọn file từ máy tính</p>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                id="banner-image-upload"
                onChange={handleChange}
                ref={fileInputRef}
              />
              <label htmlFor="banner-image-upload">
                <Button type="button" variant="outline" asChild>
                  <span>Chọn hình ảnh</span>
                </Button>
              </label>
            </div>
          </TabsContent>
          {!isMobile && (
            <TabsContent value="camera" className="mt-2">
              <div className="border-2 border-dashed rounded-md border-gray-300 p-8 flex flex-col items-center justify-center text-center">
                <Camera className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-lg font-medium">Chụp ảnh từ camera</p>
                <p className="text-sm text-muted-foreground mb-4">Sử dụng camera để chụp ảnh trực tiếp</p>
                <Button type="button" variant="outline" onClick={handleCaptureImage}>
                  <Camera className="h-4 w-4 mr-2" />
                  Mở camera
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  )
}

