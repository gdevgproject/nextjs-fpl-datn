"use client"

import { useStorageUpload } from "@/shared/hooks/use-client-storage"

export function useUploadBannerImage() {
  return useStorageUpload("banners", {
    invalidateQueryKeys: [["banners", "list"]],
  })
}
