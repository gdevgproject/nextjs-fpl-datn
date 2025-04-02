import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BannerDashboard } from "@/components/admin/banner/banner-dashboard"
import { BannerListContainer } from "@/components/admin/banner/banner-list-container"
import { PageHeader } from "@/components/admin/common/page-header"

export const metadata: Metadata = {
  title: "Quản lý Banner | MyBeauty Admin",
  description: "Quản lý banner quảng cáo trên trang web",
}

export default function BannerPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        heading="Quản lý Banner"
        description="Quản lý banner quảng cáo hiển thị trên trang web"
        action={
          <Link href="/admin/banner/them">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Banner
            </Button>
          </Link>
        }
      />

      <BannerDashboard />

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full sm:w-auto flex flex-wrap justify-start mb-2">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
          <TabsTrigger value="inactive">Không hoạt động</TabsTrigger>
          <TabsTrigger value="scheduled">Đã lên lịch</TabsTrigger>
          <TabsTrigger value="expired">Đã hết hạn</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <BannerListContainer filter="all" />
        </TabsContent>
        <TabsContent value="active">
          <BannerListContainer filter="active" />
        </TabsContent>
        <TabsContent value="inactive">
          <BannerListContainer filter="inactive" />
        </TabsContent>
        <TabsContent value="scheduled">
          <BannerListContainer filter="scheduled" />
        </TabsContent>
        <TabsContent value="expired">
          <BannerListContainer filter="expired" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

