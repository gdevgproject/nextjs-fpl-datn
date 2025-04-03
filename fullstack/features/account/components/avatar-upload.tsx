"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/providers/auth-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { uploadAvatar } from "../actions"
import { DEFAULT_AVATAR_URL } from "@/lib/constants"
import { Loader2, Upload, Check } from "lucide-react"

export function AvatarUpload() {
  const { profile, refreshProfile, profileImageUrl } = useAuth()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Xóa preview khi profileImageUrl thay đổi
  useEffect(() => {
    if (profileImageUrl) {
      setPreviewUrl(null)
      setSelectedFile(null)
    }
  }, [profileImageUrl])

  // Xử lý khi người dùng chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB",
        variant: "destructive",
      })
      return
    }

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "Chỉ chấp nhận file hình ảnh",
        variant: "destructive",
      })
      return
    }

    // Tạo preview URL và lưu file đã chọn
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setSelectedFile(file)
  }

  // Sửa hàm handleUpload để xử lý lỗi tốt hơn và đảm bảo isUploading được reset
  const handleUpload = async () => {
    if (!selectedFile || !profile) return

    setIsUploading(true)

    try {
      console.log("Bắt đầu tải ảnh lên...")
      const result = await uploadAvatar(profile.id, selectedFile)

      console.log("Kết quả tải lên:", result)

      if (result.error) {
        console.error("Lỗi từ server:", result.error)
        toast({
          title: "Lỗi",
          description: result.error,
          variant: "destructive",
        })
        setIsUploading(false)
        return
      }

      // Xóa file đã chọn và preview sau khi tải lên thành công
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setSelectedFile(null)
      setPreviewUrl(null)

      // Hiển thị toast trước khi refresh profile
      toast({
        title: "Thành công",
        description: "Ảnh đại diện đã được cập nhật",
      })

      // Refresh profile để cập nhật avatar mới
      try {
        await refreshProfile()
        console.log("Profile đã được refresh")
      } catch (refreshError) {
        console.error("Lỗi khi refresh profile:", refreshError)
        // Không hiển thị lỗi này cho người dùng vì ảnh đã được tải lên thành công
      }
    } catch (error) {
      console.error("Lỗi khi tải lên ảnh đại diện:", error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi tải lên ảnh đại diện",
        variant: "destructive",
      })
    } finally {
      // Đảm bảo isUploading luôn được đặt lại thành false
      setIsUploading(false)
    }
  }

  // Xử lý hủy chọn ảnh
  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setSelectedFile(null)
  }

  // Sử dụng previewUrl nếu có, nếu không thì sử dụng profileImageUrl
  const displayImageUrl = previewUrl || profileImageUrl || DEFAULT_AVATAR_URL

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-primary/20">
        <Image
          src={displayImageUrl || "/placeholder.svg"}
          alt={profile?.display_name || "Avatar"}
          fill
          className="object-cover"
          sizes="128px"
          priority
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {selectedFile ? (
          <div className="flex gap-2">
            <Button onClick={handleUpload} size="sm" disabled={isUploading} className="flex items-center gap-2">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span>Xác nhận</span>
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm" disabled={isUploading}>
              Hủy
            </Button>
          </div>
        ) : (
          <Button asChild variant="outline" size="sm" disabled={isUploading}>
            <label className="flex cursor-pointer items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Chọn ảnh</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </Button>
        )}
        <p className="text-xs text-muted-foreground">Định dạng: JPG, PNG. Tối đa: 5MB</p>
      </div>
    </div>
  )
}

