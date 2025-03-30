"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { Upload, Loader2 } from "lucide-react"

interface AvatarUploadProps {
  initialImage?: string
}

export function AvatarUpload({ initialImage }: AvatarUploadProps) {
  const [avatar, setAvatar] = useState(initialImage || "")
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Kiểm tra loại file
    if (!file.type.includes("image")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file hình ảnh",
        variant: "destructive",
      })
      return
    }

    // Kiểm tra kích thước file (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 2MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Giả lập upload file
    const reader = new FileReader()
    reader.onload = () => {
      setTimeout(() => {
        setAvatar(reader.result as string)
        setIsUploading(false)
        toast({
          title: "Tải lên thành công",
          description: "Ảnh đại diện của bạn đã được cập nhật",
        })
      }, 1500)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatar} alt="Avatar" />
        <AvatarFallback>{avatar ? "..." : "NT"}</AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => document.getElementById("avatar-upload")?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải lên
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Tải ảnh lên
            </>
          )}
        </Button>
        {avatar && (
          <Button variant="outline" size="sm" disabled={isUploading} onClick={() => setAvatar("")}>
            Xóa ảnh
          </Button>
        )}
      </div>
      <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <p className="text-xs text-muted-foreground">Cho phép JPG, GIF hoặc PNG. Kích thước tối đa 2MB.</p>
    </div>
  )
}

