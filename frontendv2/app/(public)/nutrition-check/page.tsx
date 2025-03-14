import type { Metadata } from "next"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import NutritionCheckForm from "@/features/nutrition-check/components/NutritionCheckForm"
import { generateMetadata as generateSeoMetadata } from "@/utils/seo"

export const metadata: Metadata = generateSeoMetadata({
  title: "Kiểm Tra Dinh Dưỡng - Elena Pharmacy",
  description: "Kiểm tra thói quen ăn uống và nhận tư vấn dinh dưỡng",
})

export default function NutritionCheckPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FE] pb-12 pt-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "Trang Chủ", href: "/" }, { label: "Kiểm Tra Dinh Dưỡng" }]} />

        {/* Main Content */}
        <div className="mx-auto max-w-xl">
          <h1 className="text-xl font-bold text-grayscale-90">Thói quen ăn uống hàng ngày</h1>
          <p className="mb-6 text-sm text-[#6C757D]">Hãy nhập thông tin dưới đây để nhận phân tích chi tiết</p>

          <NutritionCheckForm />
        </div>
      </div>
    </div>
  )
}

