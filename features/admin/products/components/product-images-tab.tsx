"use client";

import type React from "react";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  useProductImages,
  useCreateProductImage,
  useUpdateProductImage,
  useDeleteProductImage,
} from "../hooks/use-product-images";
import { useUploadProductImage } from "../hooks/use-upload-product-image";
import { useDeleteProductImages } from "../hooks/use-delete-product-images";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, ImageIcon, Star, StarIcon } from "lucide-react";

interface ProductImagesTabProps {
  productId: number | null | undefined;
}

export function ProductImagesTab({ productId }: ProductImagesTabProps) {
  const toast = useSonnerToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<any | null>(null);
  const [altText, setAltText] = useState("");

  // Fetch images for the product
  const {
    data: imagesData,
    isLoading,
    isError,
  } = useProductImages(productId || null);

  // Mutations for creating, updating, and deleting images
  const createImageMutation = useCreateProductImage();
  const updateImageMutation = useUpdateProductImage();
  const deleteImageMutation = useDeleteProductImage();
  const uploadImageMutation = useUploadProductImage();
  const deleteStorageMutation = useDeleteProductImages();

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !productId) return;

    setIsUploading(true);

    try {
      // Process each selected file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file type
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!validTypes.includes(file.type)) {
          toast.error(
            `Định dạng file "${file.name}" không hợp lệ. Chỉ chấp nhận JPG, PNG, GIF, WEBP.`
          );
          continue;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`File "${file.name}" quá lớn. Kích thước tối đa là 5MB.`);
          continue;
        }

        // Create file path
        const fileExt = file.name.split(".").pop();
        const filePath = `${productId}/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 7)}.${fileExt}`;

        // Upload file
        const result = await uploadImageMutation.mutateAsync({
          file,
          path: filePath,
          fileOptions: {
            contentType: file.type,
            upsert: true,
          },
        });

        // Create image record in database
        await createImageMutation.mutateAsync({
          productId: productId, // Fixed: Changed from product_id to productId to match expected parameter name
          imageUrl: result.publicUrl, // Use imageUrl instead of image_url
          altText: altText || null, // Use altText instead of alt_text
          isMain: (imagesData?.data?.length || 0) === 0, // Use isMain instead of is_main
          displayOrder: (imagesData?.data?.length || 0) + i, // Use displayOrder instead of display_order
        });
      }

      // Reset file input and alt text
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setAltText("");

      toast.success("Hình ảnh đã được tải lên thành công");
    } catch (error) {
      toast.error(
        `Lỗi khi tải lên hình ảnh: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (image: any) => {
    setImageToDelete(image);
    setIsDeleting(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!imageToDelete || !productId) return;

    try {
      // Delete image record from database
      await deleteImageMutation.mutateAsync({
        id: imageToDelete.id,
        imageUrl: imageToDelete.image_url,
        productId: productId,
        isMain: imageToDelete.is_main,
      });

      // Delete image file from storage if needed
      if (imageToDelete.image_url) {
        await deleteStorageMutation.deleteFromUrl(imageToDelete.image_url);
      }

      toast.success("Hình ảnh đã được xóa thành công");
    } catch (error) {
      toast.error(
        `Lỗi khi xóa hình ảnh: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeleting(false);
      setImageToDelete(null);
    }
  };

  // Handle set as main image
  const handleSetMainImage = async (image: any) => {
    if (!image || image.is_main || !productId) return;

    try {
      // Update image to set as main
      await updateImageMutation.mutateAsync({
        id: image.id,
        productId: productId, // Add productId to ensure proper cache invalidation
        isMain: true, // Use camelCase to match the expected property in the hook
      });

      toast.success("Đã đặt làm ảnh chính");
    } catch (error) {
      toast.error(
        `Lỗi khi đặt ảnh chính: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Handle upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!productId) {
    return (
      <div className="flex justify-center items-center p-8">
        <p>Vui lòng tạo sản phẩm trước khi thêm hình ảnh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Tải lên hình ảnh</CardTitle>
          <CardDescription>
            Tải lên hình ảnh cho sản phẩm. Hình ảnh đầu tiên sẽ được đặt làm ảnh
            chính.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="alt-text">Mô tả ảnh (Alt text)</Label>
              <Textarea
                id="alt-text"
                placeholder="Nhập mô tả cho hình ảnh (tùy chọn)"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Mô tả ngắn gọn về hình ảnh, giúp cải thiện SEO và trải nghiệm
                người dùng khiếm thị.
              </p>
            </div>

            <div className="flex items-center justify-center w-full">
              <Label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Nhấp để tải lên</span> hoặc
                    kéo thả
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF, WEBP (Tối đa 5MB)
                  </p>
                </div>
                <input
                  id="image-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleUploadClick} disabled={isUploading}>
            {isUploading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Đang tải lên...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Tải lên hình ảnh
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Images Gallery */}
      <Card>
        <CardHeader>
          <CardTitle>Thư viện hình ảnh</CardTitle>
          <CardDescription>
            Quản lý hình ảnh của sản phẩm. Nhấp vào biểu tượng sao để đặt làm
            ảnh chính.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center py-4">
              Đã xảy ra lỗi khi tải dữ liệu hình ảnh.
            </div>
          ) : imagesData?.data?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="mx-auto h-12 w-12 mb-2" />
              <p>Chưa có hình ảnh nào cho sản phẩm này.</p>
              <p className="text-sm mt-2">
                Sử dụng form bên trên để tải lên hình ảnh mới.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagesData?.data?.map((image: any) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square relative overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={image.image_url || "/placeholder.svg"}
                      alt={image.alt_text || "Product image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      variant={image.is_main ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                      onClick={() => handleSetMainImage(image)}
                      disabled={image.is_main}
                      title={image.is_main ? "Ảnh chính" : "Đặt làm ảnh chính"}
                    >
                      {image.is_main ? (
                        <StarIcon className="h-4 w-4" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {image.is_main ? "Ảnh chính" : "Đặt làm ảnh chính"}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm text-red-500 hover:text-red-600 hover:bg-background/90"
                      onClick={() => handleDeleteClick(image)}
                      title="Xóa ảnh"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Xóa ảnh</span>
                    </Button>
                  </div>
                  {image.alt_text && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-background/80 backdrop-blur-sm text-xs truncate">
                      {image.alt_text}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa hình ảnh</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hình ảnh này không? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
