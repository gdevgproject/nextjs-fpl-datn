import ProductListPage from "@/features/shop/plp/components/product-list-page"
import { createClient } from "@/shared/supabase/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

interface GenderPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: GenderPageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { data: gender } = await supabase
    .from("genders")
    .select("name")
    .eq("name", params.slug.replace(/-/g, " "))
    .single()

  if (!gender) {
    return {
      title: "Giới tính không tồn tại | MyBeauty",
      description: "Danh mục giới tính bạn đang tìm kiếm không tồn tại.",
    }
  }

  return {
    title: `Nước hoa ${gender.name} | MyBeauty`,
    description: `Khám phá bộ sưu tập nước hoa dành cho ${gender.name} của chúng tôi.`,
  }
}

export default async function GenderPage({ params }: GenderPageProps) {
  const supabase = await createClient()
  const { data: gender } = await supabase
    .from("genders")
    .select("id")
    .eq("name", params.slug.replace(/-/g, " "))
    .single()

  if (!gender) {
    notFound()
  }

  return <ProductListPage initialGenderId={gender.id} />
}
