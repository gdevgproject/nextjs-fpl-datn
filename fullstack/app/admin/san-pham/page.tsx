import React from "react";
import { ProductList } from "@/features/admin/product-management/components/product-list";
import { ProductBulkActions } from "@/features/admin/product-management/components/product-bulk-actions";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";
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
      <AdminPageHeader
        title="Quản lý sản phẩm"
        description="Thêm, sửa, xóa sản phẩm và quản lý tồn kho"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/admin/san-pham/nhap-excel">
                <FileUp className="mr-2 h-4 w-4" />
                Nhập Excel
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/san-pham/them">
                <Plus className="mr-2 h-4 w-4" />
                Thêm sản phẩm
              </Link>
            </Button>
          </>
        }
      />

      <ProductList />
    </div>
  );
}
