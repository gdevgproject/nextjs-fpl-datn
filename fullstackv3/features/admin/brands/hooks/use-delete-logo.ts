"use client";

import { useStorageDelete } from "@/shared/hooks/use-client-storage";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = getSupabaseBrowserClient();

export function useDeleteBrandLogo() {
  const deleteStorageMutation = useStorageDelete("logos", {
    invalidateQueryKeys: [["brands", "list"]],
  });

  // Mở rộng mutation để xử lý lỗi tốt hơn và hỗ trợ xóa từ URL
  return {
    ...deleteStorageMutation,
    // Thêm phương thức để xóa file từ URL
    deleteFromUrl: async (url: string): Promise<boolean> => {
      try {
        if (!url) return false;

        // Trích xuất đường dẫn từ URL
        // URL có dạng: https://xxx.supabase.co/storage/v1/object/public/logos/brands/123/logo.png
        const urlParts = url.split("/logos/");
        if (urlParts.length <= 1) return false;

        const path = urlParts[1];
        if (!path) return false;

        // Xóa file
        const { error } = await supabase.storage.from("logos").remove([path]);

        if (error) {
          console.error("Error deleting logo:", error);
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error in deleteFromUrl:", error);
        return false;
      }
    },
  };
}
