"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import { useUploadCategoryImage } from "../hooks/use-upload-category-image";
import { useDeleteCategoryImage } from "../hooks/use-delete-category-image";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";

interface CategoryImageUploaderProps {
  initialImageUrl?: string;
  categoryId?: number;
  onChange: (file: File | null, url: string | null) => void;
}

export function CategoryImageUploader({
  initialImageUrl,
  categoryId,
  onChange,
}: CategoryImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImageUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previousImageUrl, setPreviousImageUrl] = useState<string | null>(
    initialImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useSonnerToast();

  // Upload and delete image mutations
  const uploadImageMutation = useUploadCategoryImage();
  const deleteImageMutation = useDeleteCategoryImage();

  // Update preview URL and previous image URL when initialImageUrl changes
  useEffect(() => {
    setPreviewUrl(initialImageUrl || null);
    setPreviousImageUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(
        "Định dạng file không hợp lệ. Vui lòng chọn file PNG, JPG, GIF hoặc WEBP."
      );
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.");
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);

    // For new categories (without categoryId), we just store the file and preview URL
    // The actual upload will happen after category creation in the CategoryDialog component
    if (!categoryId) {
      onChange(file, objectUrl);
    } else {
      // For existing categories, upload immediately
      await uploadImage(file, categoryId);
    }

    // Clean up the object URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Upload image to storage
  const uploadImage = async (file: File, id: number) => {
    try {
      setIsUploading(true);

      // Create file path
      const fileExt = file.name.split(".").pop();
      const filePath = `categories/${id}/image.${fileExt}`;

      // Upload file
      const result = await uploadImageMutation.mutateAsync({
        file,
        path: filePath,
        fileOptions: {
          contentType: file.type,
          upsert: true,
        },
      });

      // Update form with the new URL
      onChange(file, result.publicUrl);

      // Delete old image if it exists and is different from the new image
      if (previousImageUrl && previousImageUrl !== result.publicUrl) {
        try {
          await deleteImageMutation.deleteFromUrl(previousImageUrl);
          // Update previousImageUrl after successful deletion
          setPreviousImageUrl(result.publicUrl);
        } catch (error) {
          console.error("Error deleting previous image:", error);
          // Don't show error to user since the new image was uploaded successfully
        }
      } else {
        // Update previousImageUrl if there was no old image
        setPreviousImageUrl(result.publicUrl);
      }

      toast.success("Ảnh đã được tải lên thành công");
    } catch (error) {
      toast.error(
        `Lỗi khi tải lên ảnh: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      // Revert to initial image if upload fails
      setPreviewUrl(initialImageUrl || null);
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle remove button click
  const handleRemove = async () => {
    setIsUploading(true);

    try {
      // If we have a previousImageUrl, delete the file from storage
      if (previousImageUrl) {
        await deleteImageMutation.deleteFromUrl(previousImageUrl);
      }

      // Clear preview and file input
      setPreviewUrl(null);
      setSelectedFile(null);
      setPreviousImageUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onChange(null, null);
      toast.success("Ảnh đã được xóa thành công");
    } catch (error) {
      toast.error(
        `Lỗi khi xóa ảnh: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Handle upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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
              alt="Category image preview"
              fill
              className="object-cover p-2"
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
              <span className="sr-only">Remove image</span>
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
            <ImageIcon className="h-10 w-10 mb-2" />
            <p className="text-xs text-center">Chưa có ảnh</p>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
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
        {previewUrl ? "Thay đổi ảnh" : "Tải lên ảnh"}
      </Button>
    </div>
  );
}
