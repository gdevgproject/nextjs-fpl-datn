import type { Metadata } from "next"
import { BrandsPage } from "@/features/brands/components/brands-page"

export const metadata: Metadata = {
  title: "Thương hiệu - MyBeauty",
  description: "Khám phá các thương hiệu nước hoa cao cấp tại MyBeauty",
}

export default function Page() {
  return <BrandsPage />
}

