<<<<<<< HEAD
import type { Metadata } from "next"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductDashboard } from "@/components/admin/san-pham/product-dashboard"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const metadata: Metadata = {
  title: "Quản lý sản phẩm - Admin MyBeauty",
  description: "Quản lý danh sách sản phẩm của cửa hàng MyBeauty",
}

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/san-pham" isActive>
                Sản phẩm
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Quản lý sản phẩm</h1>
          <Button asChild>
            <Link href="/admin/san-pham/them">
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Link>
          </Button>
        </div>
      </div>

      <ProductDashboard />
    </div>
  )
}

=======
import React from "react";
import { ProductList } from "@/features/admin/product-management/components/product-list";
import { ProductBulkActions } from "@/features/admin/product-management/components/product-bulk-actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileUp, Plus } from "lucide-react";

export const metadata = {
  title: "Quản lý sản phẩm | Admin",
  description: "Quản lý danh sách sản phẩm",
};

export default function ProductManagementPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <ProductList />
    </div>
  );
}
>>>>>>> origin/feat/quan-ly-hinh-anh
