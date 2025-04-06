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
