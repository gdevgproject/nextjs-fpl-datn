import { ProductListingPage } from "@/features/shop/plp/components/product-listing-page"

export const metadata = {
  title: "Sản phẩm | MyBeauty",
  description: "Khám phá các sản phẩm nước hoa cao cấp tại MyBeauty",
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return <ProductListingPage searchParams={searchParams} />
}
