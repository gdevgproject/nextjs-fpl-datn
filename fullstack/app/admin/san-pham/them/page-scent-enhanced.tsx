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

export default function ProductScentPage() {
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
                <BreadcrumbLink href="/admin/san-pham/them">Thêm sản phẩm</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Hương thơm</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Link href="/admin/san-pham/them">
          <Button variant="outline">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      <ProductScentManager />
    </div>
  )
}

