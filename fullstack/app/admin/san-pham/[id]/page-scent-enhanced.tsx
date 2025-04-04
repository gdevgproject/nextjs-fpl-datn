import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductScentManager } from "@/components/admin/san-pham/product-scent-manager"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const metadata: Metadata = {
  title: "Quản lý hương thơm sản phẩm",
  description: "Thêm và quản lý các tầng hương cho sản phẩm nước hoa",
}

interface ProductScentPageProps {
  params: {
    id: string
  }
}

export default function ProductScentPage({ params }: ProductScentPageProps) {
  // Dữ liệu mẫu cho hương thơm của sản phẩm
  const sampleScents = [
    { id: "1", scent_id: "8", scent_name: "Cam bergamot", scent_type: "top" as const, intensity: 4 },
    { id: "2", scent_id: "9", scent_name: "Chanh", scent_type: "top" as const, intensity: 3 },
    { id: "3", scent_id: "4", scent_name: "Hoa oải hương", scent_type: "middle" as const, intensity: 3 },
    { id: "4", scent_id: "6", scent_name: "Gỗ đàn hương", scent_type: "base" as const, intensity: 4 },
    { id: "5", scent_id: "7", scent_name: "Xạ hương", scent_type: "base" as const, intensity: 3 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý hương thơm</h1>
          <Breadcrumb className="mt-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Trang chủ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/san-pham">Sản phẩm</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/admin/san-pham/${params.id}`}>Chi tiết sản phẩm</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Hương thơm</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Link href={`/admin/san-pham/${params.id}`}>
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      <ProductScentManager productId={params.id} initialScents={sampleScents} />
    </div>
  )
}

