"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useUploadLogo } from "../hooks/use-upload-logo";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Upload } from "lucide-react";

interface LogoUploaderProps {
  shopId: number;
  existingLogoUrl: string | null;
}

export function LogoUploader({ shopId, existingLogoUrl }: LogoUploaderProps) {
  const toast = useSonnerToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { mutate: uploadLogo, isPending } = useUploadLogo();

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation for better UX
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file hình ảnh");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 2MB");
      return;
    }

    // Create preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const isUpdate = !!existingLogoUrl;

    uploadLogo(
      {
        file: selectedFile,
        id: shopId,
        oldLogoUrl: existingLogoUrl,
      },
      {
        onSuccess: () => {
          const message = isUpdate
            ? "Logo đã được cập nhật thành công"
            : "Logo đã được tải lên thành công";

          toast.success(message, {
            description: "Logo mới đã được cập nhật và hiển thị trên cửa hàng.",
          });

          // Clean up
          setSelectedFile(null);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }

          // Reset file input
          const fileInput = document.getElementById(
            "logo-upload"
          ) as HTMLInputElement;
          if (fileInput) fileInput.value = "";
        },
        onError: (error) => {
          toast.error(
            isUpdate ? "Lỗi khi cập nhật logo" : "Lỗi khi tải lên logo",
            {
              description:
                error.message ||
                "Vui lòng thử lại sau hoặc liên hệ quản trị viên.",
            }
          );
        },
      }
    );
  };

  const getButtonLabel = () => {
    if (isPending) return "Đang tải lên...";
    if (existingLogoUrl) return "Cập nhật logo";
    return "Tải lên";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 overflow-hidden rounded-md border">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Preview logo"
              fill
              className="object-contain"
              sizes="96px"
            />
          ) : existingLogoUrl ? (
            <Image
              src={existingLogoUrl}
              alt="Shop logo"
              fill
              className="object-contain"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-xs text-muted-foreground">
                Chưa có logo
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div>
              <input
                type="file"
                id="logo-upload"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
                disabled={isPending}
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                <Upload className="mr-2 h-4 w-4" />
                Chọn file
              </label>
            </div>
            {selectedFile && (
              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                disabled={isPending}
              >
                {getButtonLabel()}
              </Button>
            )}
          </div>
          {selectedFile && (
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {selectedFile.name}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Chấp nhận các định dạng JPG, PNG, GIF hoặc WEBP. Kích thước tối đa
            2MB.
          </p>
        </div>
      </div>
    </div>
  );
}
