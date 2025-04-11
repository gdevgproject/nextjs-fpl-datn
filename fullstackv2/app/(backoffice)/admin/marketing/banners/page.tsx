import { AdminLayout } from "@/components/layout/backoffice/admin-layout"
import { BannerManagement } from "@/features/admin/banners/components/banner-management"

export const metadata = {
  title: "Quản lý Banner | MyBeauty Admin",
  description: "Quản lý banner quảng cáo trên trang web MyBeauty",
}

export default function BannersPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Banner</h1>
          <p className="text-muted-foreground">Quản lý các banner quảng cáo hiển thị trên trang web MyBeauty.</p>
        </div>
        <BannerManagement />
      </div>
    </AdminLayout>
  )
}
