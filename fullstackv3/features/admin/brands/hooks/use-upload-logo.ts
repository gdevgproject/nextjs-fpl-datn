"use client"

import { useStorageUpload } from "@/shared/hooks/use-client-storage"

export function useUploadBrandLogo() {
  return useStorageUpload("logos", {
    invalidateQueryKeys: [["brands", "list"]],
  })
}
