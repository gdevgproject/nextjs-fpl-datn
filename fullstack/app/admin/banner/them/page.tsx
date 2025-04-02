import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BannerForm } from "@/components/admin/banner/banner-form"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export const metadata: Metadata = {
  title: "Thêm Banner Mới | MyBeauty Admin",
  description: "Thêm banner quảng cáo mới cho trang web",
}

export default function AddBannerPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/banner">Quản lý Banner</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Thêm mới</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <div className="flex items-center gap-2">
            <Link href="/admin/banner">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Thêm Banner Mới</h1>
          </div>
        </div>
      </div>

      <BannerForm />
    </div>
  )
}

