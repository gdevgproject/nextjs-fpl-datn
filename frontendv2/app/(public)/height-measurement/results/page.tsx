import HeightMeasurementResult from "@/features/height-measurement/components/HeightMeasurementResult"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { notFound } from "next/navigation"

export default async function HeightMeasurementResultsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  // Await the searchParams object to satisfy Next.js strict checking
  const params = await searchParams
  const resultId = params.id

  // Validate required parameter
  if (!resultId) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background pb-8 sm:pb-12 pt-4 sm:pt-6">
      <div className="container mx-auto px-4">
        <div className="max-w-[1000px] mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Trang Chủ", href: "/" },
              { label: "Đo Cao", href: "/height-measurement" },
              { label: "Kết quả phân tích" },
            ]}
          />

          {/* Main Content - Wider container for the chart */}
          <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
            <h1 className="mb-1 sm:mb-2 text-xl sm:text-2xl font-bold text-grayscale-90">Kết quả phân tích đo cao</h1>
            <p className="mb-4 sm:mb-6 text-sm text-grayscale-60">
              Dựa vào thông tin được cung cấp, bạn có thể tham khảo
            </p>

            <HeightMeasurementResult resultId={resultId} />
          </div>
        </div>
      </div>
    </div>
  )
}

