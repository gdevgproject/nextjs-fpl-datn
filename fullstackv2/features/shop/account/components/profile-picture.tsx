"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Loader2, Camera } from "lucide-react"
import { useUploadAvatar } from "../hooks/use-upload-avatar"
import { useAuth } from "@/features/auth/context/auth-context"

interface ProfilePictureProps {
  avatarUrl: string | null | undefined
  userId: string | undefined
}

export function ProfilePicture({ avatarUrl, userId }: ProfilePictureProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { uploadAvatar, isUploading, cancelUpload } = useUploadAvatar()

  // Get user display name from metadata for the avatar fallback
  const displayName =
    user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || ""

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB")
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !userId) return

    try {
      await uploadAvatar(selectedFile)
      // Clear preview and selected file after successful upload
      setPreviewUrl(null)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error)
    }
  }

  const handleCancel = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    cancelUpload()
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center">
        <div className="relative mb-6 group">
          <Avatar className="w-40 h-40 border-2 border-primary">
            <AvatarImage src={previewUrl || avatarUrl || ""} alt="Profile picture" />
            <AvatarFallback className="text-4xl">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <button
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={triggerFileInput}
            type="button"
          >
            <Camera className="h-5 w-5" />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
        />

        {selectedFile ? (
          <div className="space-y-4 w-full">
            <p className="text-sm text-center truncate">
              {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Cập nhật ảnh
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={triggerFileInput} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Chọn ảnh đại diện
          </Button>
        )}

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Hỗ trợ định dạng JPG, PNG, GIF hoặc WEBP. Kích thước tối đa 5MB.
        </p>
      </CardContent>
    </Card>
  )
}
