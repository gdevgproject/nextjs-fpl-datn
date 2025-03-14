import type { Metadata } from "next"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import HeightMeasurementForm from "@/features/height-measurement/components/HeightMeasurementForm"
import { generateMetadata as generateSeoMetadata } from "@/utils/seo"

export const metadata: Metadata = generateSeoMetadata({
  title: "Đo Cao - Elena Pharmacy",
  description: "Công cụ đo và dự đoán chiều cao cho trẻ em",
})

export default function HeightMeasurementPage() {
  return (
    <div className="min-h-screen bg-[#f1f4fd] pb-8 sm:pb-12 pt-4 sm:pt-6">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: "Trang Chủ", href: "/" }, { label: "Đo Cao" }]} />

          {/* Title Section */}
          <div className="mb-4 sm:mb-6">
            <h1 className="mb-1 sm:mb-2 text-xl sm:text-[28px] font-bold text-grayscale-90">Hướng dẫn chiều cao</h1>
            <p className="text-sm sm:text-base text-[#6C757D]">
              Hãy nhập thông tin dưới đây để nhận phân tích chi tiết
            </p>
          </div>

          {/* Form Section */}
          <div className="rounded-xl bg-white p-4 sm:p-6 shadow-sm">
            <HeightMeasurementForm />
          </div>
        </div>
      </div>
    </div>
  )
}

