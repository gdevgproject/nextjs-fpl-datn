"use client"

import { useStorageUpload } from "@/shared/hooks/use-client-storage"

export function useUploadProductImage() {
  return useStorageUpload("products", {
    invalidateQueryKeys: [["product_images", "by_product"]],
  })
}
