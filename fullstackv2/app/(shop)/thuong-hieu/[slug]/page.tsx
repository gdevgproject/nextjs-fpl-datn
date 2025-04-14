import ProductListPage from "@/features/shop/plp/components/product-list-page"
import { createClient } from "@/shared/supabase/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

interface BrandPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { data: brand } = await supabase
    .from("brands")
    .select("name, description")
    .ilike("name", params.slug.replace(/-/g, " "))
    .single()

  if (!brand) {
    return {
      title: "Thương hiệu không tồn tại | MyBeauty",
      description: "Thương hiệu bạn đang tìm kiếm không tồn tại.",
    }
  }

  return {
    title: `${brand.name} | MyBeauty`,
    description: brand.description || `Khám phá bộ sưu tập nước hoa ${brand.name} chính hãng.`,
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const supabase = await createClient()
  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .ilike("name", params.slug.replace(/-/g, " "))
    .single()

  if (!brand) {
    notFound()
  }

  return <ProductListPage initialBrandId={brand.id} />
}
