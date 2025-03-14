// "use client"

import { Button } from "@/components/ui/Button"
import { CheckCircle2 } from "lucide-react"
import { useNutritionCheckResult } from "../hooks/useNutritionCheckMutation"

interface NutritionCheckResultProps {
  resultId?: string
}

const foodLabels: Record<string, string> = {
  egg: "Trứng",
  chicken: "Thịt gà",
  beef: "Thịt bò",
  pork: "Thịt heo",
  vegetables: "Rau xanh",
}

export default function NutritionCheckResult({ resultId }: NutritionCheckResultProps) {
  const result = useNutritionCheckResult(resultId)

  if (!result) {
    return (
      <div className="flex items-center justify-center py-12" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <p className="text-grayscale-60">Không tìm thấy kết quả. Vui lòng thử lại.</p>
        </div>
      </div>
    )
  }

  return (
    <article className="space-y-6" aria-labelledby="nutrition-result-title">
      <h2 id="nutrition-result-title" className="sr-only">
        Kết quả kiểm tra dinh dưỡng
      </h2>

      {/* Success Message */}
      <header className="bg-gradient-to-r from-primary-5 to-primary-20 p-4 text-white">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-success-5" aria-hidden="true" />
          <div>
            <h3 className="font-medium">KẾT QUẢ ĐÃ ĐƯỢC GHI NHẬN</h3>
            <p className="text-sm text-white/90">
              Cảm ơn bạn, kết quả đã được trả về Zalo OA cho bạn
            </p>
          </div>
        </div>
      </header>

      {/* Result Details */}
      <section className="space-y-6">
        <div className="space-y-2">
          <label className="flex items-center text-sm text-error-5" htmlFor="result-name">
            * <span className="ml-1 text-grayscale-90">Họ và tên</span>
          </label>
          <input
            type="text"
            id="result-name"
            value={result.name}
            readOnly
            className="w-full rounded border border-grayscale-20 bg-white px-3 py-2 text-sm text-grayscale-90"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm text-error-5" htmlFor="result-birthdate">
            * <span className="ml-1 text-grayscale-90">Ngày sinh</span>
          </label>
          <input
            type="text"
            id="result-birthdate"
            value={result.birthDate}
            readOnly
            className="w-full rounded border border-grayscale-20 bg-white px-3 py-2 text-sm text-grayscale-90"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm text-error-5" htmlFor="result-foods">
            * <span className="ml-1 text-grayscale-90">Món ăn thường xuyên</span>
          </label>
          <input
            type="text"
            id="result-foods"
            value={result.regularFoods.map((food) => foodLabels[food]).join(", ")}
            readOnly
            className="w-full rounded border border-grayscale-20 bg-white px-3 py-2 text-sm text-grayscale-90"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center text-sm text-error-5" htmlFor="result-known">
            * <span className="ml-1 text-grayscale-90">Sản phẩm của chúng tôi</span>
          </label>
          <input
            type="text"
            id="result-known"
            value={result.knownProduct === "yes" ? "Đã biết" : "Chưa biết"}
            readOnly
            className="w-full rounded border border-grayscale-20 bg-white px-3 py-2 text-sm text-grayscale-90"
          />
        </div>
      </section>

      {/* Actions */}
      <footer className="flex justify-end gap-3">
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          className="rounded border border-primary-5 px-6 py-2 text-sm font-medium text-primary-5 hover:bg-primary-5/5"
        >
          Quay lại
        </Button>
        <Button className="rounded bg-primary-5 px-6 py-2 text-sm font-medium text-white hover:bg-primary-20">
          Xác nhận
        </Button>
      </footer>
    </article>
  )
}
