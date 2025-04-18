"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon } from "lucide-react"
import { useUploadBrandLogo } from "../hooks/use-upload-logo"
import { useDeleteBrandLogo } from "../hooks/use-delete-logo"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"

interface LogoUploaderProps {
  initialImageUrl?: string
  brandId?: number
  onChange: (file: File | null, url: string | null) => void
}

export function LogoUploader({ initialImageUrl, brandId, onChange }: LogoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previousLogoUrl, setPreviousLogoUrl] = useState<string | null>(initialImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useSonnerToast()

  // Upload and delete logo mutations
  const uploadLogoMutation = useUploadBrandLogo()
  const deleteLogoMutation = useDeleteBrandLogo()

  // Update preview URL and previous logo URL when initialImageUrl changes
  useEffect(() => {
    setPreviewUrl(initialImageUrl || null)
    setPreviousLogoUrl(initialImageUrl || null)
  }, [initialImageUrl])

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      toast.error("Định dạng file không hợp lệ. Vui lòng chọn file PNG, JPG, GIF, WEBP hoặc SVG.")
      return
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 2MB.")
      return
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setSelectedFile(file)

    // For new brands (without brandId), we just store the file and preview URL
    // The actual upload will happen after brand creation in the BrandDialog component
    if (!brandId) {
      onChange(file, objectUrl)
    } else {
      // For existing brands, upload immediately
      await uploadLogo(file, brandId)
    }

    // Clean up the object URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }

  // Upload logo to storage
  const uploadLogo = async (file: File, id: number) => {
    try {
      setIsUploading(true)

      // Create file path
      const fileExt = file.name.split(".").pop()
      const filePath = `brands/${id}/logo.${fileExt}`

      // Upload file
      const result = await uploadLogoMutation.mutateAsync({
        file,
        path: filePath,
        fileOptions: {
          contentType: file.type,
          upsert: true,
        },
      })

      // Update form with the new URL
      onChange(file, result.publicUrl)

      // Xóa ảnh cũ nếu có và khác với ảnh mới
      if (previousLogoUrl && previousLogoUrl !== result.publicUrl) {
        try {
          await deleteLogoMutation.deleteFromUrl(previousLogoUrl)
          // Cập nhật previousLogoUrl sau khi xóa thành công
          setPreviousLogoUrl(result.publicUrl)
        } catch (error) {
          console.error("Error deleting previous logo:", error)
          // Không hiển thị lỗi cho người dùng vì ảnh mới đã được tải lên thành công
        }
      } else {
        // Cập nhật previousLogoUrl nếu không có ảnh cũ
        setPreviousLogoUrl(result.publicUrl)
      }

      toast.success("Logo đã được tải lên thành công")
    } catch (error) {
      toast.error(`Lỗi khi tải lên logo: ${error instanceof Error ? error.message : "Unknown error"}`)
      // Revert to initial image if upload fails
      setPreviewUrl(initialImageUrl || null)
      setSelectedFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle remove button click
  const handleRemove = async () => {
    setIsUploading(true)

    try {
      // If we have a previousLogoUrl, delete the file from storage
      if (previousLogoUrl) {
        await deleteLogoMutation.deleteFromUrl(previousLogoUrl)
      }

      // Clear preview and file input
      setPreviewUrl(null)
      setSelectedFile(null)
      setPreviousLogoUrl(null)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      onChange(null, null)
      toast.success("Logo đã được xóa thành công")
    } catch (error) {
      toast.error(`Lỗi khi xóa logo: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex items-center justify-center border-2 border-dashed rounded-lg w-40 h-40 ${
          previewUrl ? "border-transparent" : "border-muted-foreground/25"
        }`}
      >
        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : null}

        {previewUrl ? (
          <>
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Brand logo preview"
              fill
              className="object-contain p-2"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleRemove}
              disabled={isUploading}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove logo</span>
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
            <ImageIcon className="h-10 w-10 mb-2" />
            <p className="text-xs text-center">Chưa có logo</p>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={handleUploadClick}
        disabled={isUploading}
      >
        <Upload className="mr-2 h-4 w-4" />
        {previewUrl ? "Thay đổi logo" : "Tải lên logo"}
      </Button>
    </div>
  )
}
