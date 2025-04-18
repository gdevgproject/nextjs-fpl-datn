"use client"

import { useStorageUpload } from "@/shared/hooks/use-client-storage"

export function useUploadCategoryImage() {
  return useStorageUpload("categories", {
    invalidateQueryKeys: [["categories", "list"]],
  })
}
