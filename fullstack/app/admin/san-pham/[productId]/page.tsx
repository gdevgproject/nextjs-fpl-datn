import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, RotateCcw } from "lucide-react";
import {
  getProductById,
  softDeleteProduct,
  restoreProduct,
} from "@/features/admin/product-management/actions";
import { ProductForm } from "@/features/admin/product-management/components/product-form";
import { ProductInventoryTab } from "@/features/admin/product-management/components/product-inventory-tab";
import { ProductImagesTab } from "@/features/admin/product-management/components/product-images-tab";

export const metadata: Metadata = {
  title: "Chi tiết sản phẩm | Admin",
  description: "Quản lý chi tiết sản phẩm",
};

interface PageProps {
  params: {
    productId: string;
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const productId = parseInt(params.productId);
  if (isNaN(productId)) notFound();

  const { data: product, error } = await getProductById(productId);
  if (error || !product) notFound();

  const isDeleted = !!product.deleted_at;

  return (
    <div className="container max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/san-pham">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Chi tiết sản phẩm</h1>
          {isDeleted && (
            <span className="px-2 py-1 text-xs bg-destructive/15 text-destructive rounded-md">
              Đã xóa
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <form
            action={
              isDeleted
                ? restoreProduct.bind(null, productId)
                : softDeleteProduct.bind(null, productId)
            }
          >
            <Button
              variant="outline"
              type="submit"
              className={
                isDeleted
                  ? undefined
                  : "text-destructive border-destructive/30 hover:bg-destructive/10"
              }
            >
              {isDeleted ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Khôi phục
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </>
              )}
            </Button>
          </form>

          {!isDeleted && (
            <Button variant="default" asChild>
              <Link href={`/admin/san-pham/${productId}/chinh-sua`}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-6" />

      <div className="p-2 bg-muted/50 rounded-md mb-6">
        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Mã sản phẩm:</span>
            <span className="ml-2 font-medium">{product.product_code}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Thương hiệu:</span>
            <span className="ml-2 font-medium">
              {product.brand?.name || "Không có"}
            </span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Nồng độ:</span>
            <span className="ml-2 font-medium">
              {product.concentration?.name || "Không có"}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="details">Chi tiết</TabsTrigger>
          <TabsTrigger value="inventory">Tồn kho & Giá</TabsTrigger>
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <ProductForm initialData={product} />
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <ProductInventoryTab product={product} />
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <ProductImagesTab product={product} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
