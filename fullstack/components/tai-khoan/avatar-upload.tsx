"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { uploadAvatar } from "@/actions/profile-actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

interface AvatarUploadProps {
  currentAvatarUrl: string
  onAvatarChange: (url: string) => void
}

export function AvatarUpload({ currentAvatarUrl, onAvatarChange }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user, profile } = useAuth()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File quá lớn",
        description: "Kích thước file tối đa là 5MB",
        variant: "destructive",
      })
      return
    }

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "File không hợp lệ",
        description: "Vui lòng chọn file hình ảnh",
        variant: "destructive",
      })
      return
    }

    // Tạo preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      setIsUploading(true)

      const result = await uploadAvatar(file)

      if (result.success) {
        onAvatarChange(result.url)
        toast({
          title: "Tải lên thành công",
          description: "Ảnh đại diện của bạn đã được cập nhật",
        })
      } else {
        toast({
          title: "Tải lên thất bại",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Tải lên thất bại",
        description: "Đã xảy ra lỗi khi tải lên ảnh đại diện",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = () => {
    setPreviewUrl(null)
    onAvatarChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U"
  }

  const avatarUrl = previewUrl || currentAvatarUrl

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl} alt="Avatar" />
        <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
      </Avatar>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
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

        {avatarUrl && (
          <Button type="button" variant="outline" size="sm" onClick={handleRemoveAvatar} disabled={isUploading}>
            <X className="mr-2 h-4 w-4" />
            Xóa ảnh
          </Button>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      <div className="text-xs text-muted-foreground">Định dạng: JPG, PNG. Kích thước tối đa: 5MB</div>
    </div>
  )
}

