import type { Metadata } from "next"
import { HomePage } from "@/features/home/components/home-page"

export const metadata: Metadata = {
  title: "MyBeauty - Nước hoa chính hãng",
  description: "Cửa hàng nước hoa chính hãng với đa dạng thương hiệu cao cấp",
}

export default function Home() {
  return <HomePage />
}

