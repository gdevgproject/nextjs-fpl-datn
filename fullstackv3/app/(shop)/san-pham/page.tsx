import type { Metadata } from "next";
import { ProductListingPage } from "@/features/shop/products/components/product-listing-page";

export const metadata: Metadata = {
  title: "Sản phẩm - MyBeauty",
  description: "Khám phá bộ sưu tập nước hoa chính hãng đa dạng của chúng tôi",
};

interface ProductsPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return <ProductListingPage searchParams={searchParams} />;
}
