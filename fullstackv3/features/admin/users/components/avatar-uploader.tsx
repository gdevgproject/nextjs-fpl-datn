"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useUploadAvatar } from "../hooks/use-upload-avatar"
import { useDeleteAvatar } from "../hooks/use-delete-avatar"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"
import { Trash2, Upload } from "lucide-react"

interface AvatarUploaderProps {
  userId?: string
  initialAvatarUrl?: string
  onAvatarChange?: (url: string | null) => void
}

export function AvatarUploader({ userId, initialAvatarUrl, onAvatarChange }: AvatarUploaderProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useSonnerToast()

  const uploadAvatar = useUploadAvatar()
  const deleteAvatar = useDeleteAvatar()

  useEffect(() => {
    if (initialAvatarUrl) {
      setAvatarUrl(initialAvatarUrl)
    }
  }, [initialAvatarUrl])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return toast.error("Vui lòng chọn file hình ảnh")
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Kích thước file không được vượt quá 5MB")
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      // Upload the file
      const result = await uploadAvatar.mutateAsync({
        userId: userId || "temp", // Use temp for new users
        file,
      })

      setAvatarUrl(result.url)
      if (onAvatarChange) {
        onAvatarChange(result.url)
      }
      toast.success("Tải lên ảnh đại diện thành công")
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi tải lên ảnh đại diện")
    }
  }

  const handleDeleteAvatar = async () => {
    if (!avatarUrl) return

    try {
      await deleteAvatar.mutateAsync({
        userId: userId || "temp",
        url: avatarUrl,
      })

      setAvatarUrl(null)
      setPreviewUrl(null)
      if (onAvatarChange) {
        onAvatarChange(null)
      }
      toast.success("Xóa ảnh đại diện thành công")
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi khi xóa ảnh đại diện")
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={previewUrl || avatarUrl || ""} alt="Avatar" />
            <AvatarFallback className="text-2xl">{userId ? userId.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
          </Avatar>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("avatar-upload")?.click()}
              disabled={uploadAvatar.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadAvatar.isPending ? "Đang tải lên..." : "Tải lên"}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploadAvatar.isPending}
              />
            </Button>

            {(avatarUrl || previewUrl) && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteAvatar}
                disabled={deleteAvatar.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleteAvatar.isPending ? "Đang xóa..." : "Xóa"}
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Tải lên ảnh đại diện cho người dùng. Chấp nhận các định dạng JPG, PNG hoặc GIF.
            <br />
            Kích thước tối đa: 5MB.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
