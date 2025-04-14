import type { Metadata } from "next";
import { CategoriesPage } from "@/features/shop/categories/components/categories-page";

export const metadata: Metadata = {
  title: "Danh mục sản phẩm - MyBeauty",
  description: "Khám phá các danh mục sản phẩm đa dạng của MyBeauty",
};

export default function Page() {
  return <CategoriesPage />;
}
