import type { Metadata } from "next"
import { EnhancedImageManager } from "@/components/admin/hinh-anh/enhanced-image-manager"

export const metadata: Metadata = {
  title: "Quản lý hình ảnh - Admin MyBeauty",
  description: "Quản lý hình ảnh sản phẩm trong cửa hàng MyBeauty",
}

export default function AdminImagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý hình ảnh</h1>
      </div>

      <EnhancedImageManager />
    </div>
  )
}

