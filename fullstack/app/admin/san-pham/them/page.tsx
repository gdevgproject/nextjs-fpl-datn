import React from "react";
import { Metadata } from "next";
import { ProductForm } from "@/features/admin/product-management/components/product-form";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Thêm sản phẩm mới | Admin",
  description: "Thêm sản phẩm mới vào hệ thống",
};

export default function AddProductPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <AdminPageHeader
        title="Thêm sản phẩm mới"
        description="Điền đầy đủ thông tin để tạo sản phẩm mới"
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/san-pham">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Link>
          </Button>
        }
      />

      <ProductForm />
    </div>
  );
}
