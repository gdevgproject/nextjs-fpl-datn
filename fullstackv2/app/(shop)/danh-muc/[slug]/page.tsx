import ProductListPage from "@/features/shop/plp/components/product-list-page"
import { createClient } from "@/shared/supabase/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", params.slug)
    .single()

  if (!category) {
    return {
      title: "Danh mục không tồn tại | MyBeauty",
      description: "Danh mục bạn đang tìm kiếm không tồn tại.",
    }
  }

  return {
    title: `${category.name} | MyBeauty`,
    description: category.description || `Khám phá bộ sưu tập nước hoa ${category.name} của chúng tôi.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const supabase = await createClient()
  const { data: category } = await supabase.from("categories").select("id").eq("slug", params.slug).single()

  if (!category) {
    notFound()
  }

  return <ProductListPage initialCategoryId={category.id} />
}
