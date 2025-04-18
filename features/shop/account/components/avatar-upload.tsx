"use client";

import type React from "react";

import { useState, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Camera, Loader2, X } from "lucide-react";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";
import { useAuthQuery, useProfileQuery } from "@/features/auth/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useAvatarMutation } from "../hooks/useAvatarMutation";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

// Using memo to prevent unnecessary re-renders
export const AvatarUpload = memo(function AvatarUpload() {
  const { data: session } = useAuthQuery();
  const userId = session?.user?.id;
  const { data: profile } = useProfileQuery(userId);
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useSonnerToast();
  const { upload: uploadAvatarMutation, remove: deleteAvatarMutation } =
    useAvatarMutation(userId);

  // Handle file selection with validation and preview
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - only allow images
    if (!file.type.match(/image\/(jpeg|png|webp|gif)/)) {
      toast("File không hợp lệ", {
        description: "Vui lòng chọn file hình ảnh (JPEG, PNG, WebP, GIF)",
      });
      return;
    }

    // Validate file size - max 5MB
    if (file.size > MAX_AVATAR_SIZE) {
      toast("File quá lớn", {
        description: "Kích thước file tối đa là 5MB",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file - with error handling
    setIsUploading(true);
    try {
      await uploadAvatarMutation.mutateAsync(file);

      // Refresh profile query
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });

      toast("Cập nhật thành công", {
        description: "Ảnh đại diện của bạn đã được cập nhật",
      });
    } catch (error) {
      toast("Cập nhật thất bại", {
        description:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi cập nhật ảnh đại diện",
      });
      // Reset preview on error
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle cancel preview
  const handleCancelPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteAvatar = async () => {
    if (!userId || !profile?.avatar_url) return;
    setIsUploading(true);
    try {
      await deleteAvatarMutation.mutateAsync(profile.avatar_url);
      setPreviewUrl(null);
      setShowDeleteConfirm(false);
    } finally {
      setIsUploading(false);
    }
  };

  // Use preview URL if available, otherwise use profile avatar_url (chuẩn), fallback về default
  const currentImageUrl =
    previewUrl || profile?.avatar_url || DEFAULT_AVATAR_URL;

  // Get first letter of display name for fallback
  const nameInitial = profile?.display_name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-40 w-40">
          <AvatarImage
            src={currentImageUrl}
            alt={profile?.display_name || "Avatar"}
            className="object-cover"
            onError={(e) => {
              // Handle image load errors
              const target = e.currentTarget as HTMLImageElement;
              target.src = DEFAULT_AVATAR_URL;
            }}
          />
          <AvatarFallback className="text-4xl">{nameInitial}</AvatarFallback>
        </Avatar>

        {/* Upload button overlay */}
        <Button
          type="button"
          size="icon"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-md hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Camera className="h-5 w-5" />
          <span className="sr-only">Tải lên ảnh đại diện</span>
        </Button>

        {/* Show delete button if có avatar */}
        {profile?.avatar_url && !previewUrl && !showDeleteConfirm && (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="absolute top-0 right-0 rounded-full p-1 shadow-md"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Xóa ảnh đại diện</span>
          </Button>
        )}

        {/* Xác nhận xóa */}
        {showDeleteConfirm && (
          <div className="absolute top-0 right-0 z-10 bg-white border rounded shadow p-2 flex flex-col items-center">
            <span className="text-sm mb-2">
              Bạn có chắc muốn xóa ảnh đại diện?
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteAvatar}
                disabled={isUploading}
              >
                Xóa
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isUploading}
              >
                Hủy
              </Button>
            </div>
          </div>
        )}

        {/* Show cancel button when previewing */}
        {previewUrl && (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={handleCancelPreview}
            className="absolute top-0 right-0 rounded-full p-1 shadow-md"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Hủy</span>
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        id="avatar-upload"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={isUploading}
        aria-label="Upload avatar"
      />

      {isUploading ? (
        <Button disabled variant="outline" size="sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Đang tải lên...
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={isUploading}
        >
          <Camera className="mr-2 h-4 w-4" />
          Cập nhật ảnh
        </Button>
      )}
    </div>
  );
});
