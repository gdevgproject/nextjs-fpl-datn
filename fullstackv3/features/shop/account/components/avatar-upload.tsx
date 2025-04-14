"use client";

import type React from "react";

import { useState, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth/context/auth-context";
import { Camera, Loader2, X } from "lucide-react";
import { uploadAvatar } from "../actions";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";

// Using memo to prevent unnecessary re-renders
export const AvatarUpload = memo(function AvatarUpload() {
  const { profile, refreshProfile, profileImageUrl } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle file selection with validation and preview
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - only allow images
    if (!file.type.match(/image\/(jpeg|png|webp|gif)/)) {
      toast({
        title: "File không hợp lệ",
        description: "Vui lòng chọn file hình ảnh (JPEG, PNG, WebP, GIF)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size - max 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File quá lớn",
        description: "Kích thước file tối đa là 5MB",
        variant: "destructive",
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
      if (!profile?.id) {
        throw new Error("Bạn cần đăng nhập để thực hiện hành động này");
      }

      const result = await uploadAvatar(profile.id, file);

      if (result.error) {
        throw new Error(result.error);
      }

      // Successfully uploaded - refresh profile to get updated avatar URL
      await refreshProfile();

      toast({
        title: "Cập nhật thành công",
        description: "Ảnh đại diện của bạn đã được cập nhật",
      });
    } catch (error) {
      toast({
        title: "Cập nhật thất bại",
        description:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi cập nhật ảnh đại diện",
        variant: "destructive",
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

  // Use preview URL if available, otherwise use profile image URL
  const currentImageUrl = previewUrl || profileImageUrl || DEFAULT_AVATAR_URL;

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
