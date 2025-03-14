import { apiClient, DEFAULT_OPTION_SELLER } from "@/services/api/apiClient"
import type { NutritionCheckFormData, NutritionCheckResult, NutritionCheckService } from "../types/nutritionCheckTypes"

export class NutritionCheckRealService implements NutritionCheckService {
  async submitNutritionCheck(data: NutritionCheckFormData): Promise<NutritionCheckResult> {
    try {
      console.log("🌐 REAL API: Submitting nutrition check data:", data)

      // Chuyển đổi dữ liệu form sang định dạng API theo tài liệu
      const apiData = {
        optionSeller: DEFAULT_OPTION_SELLER,
        phone: data.phone,
        birthday: data.birthDate,
        gender: data.gender === "male" ? 1 : 2,
        height: Number(data.height),
        weight: Number(data.weight),
        name: data.name,
        note: `Kiểm tra dinh dưỡng từ website Elena Pharmacy`,
      }

      console.log("🌐 REAL API: Converted API data:", apiData)

      // Gọi API survey_result theo tài liệu
      const response = await apiClient.post("/api/crm/survey_result", apiData)

      console.log("🌐 REAL API: Raw API response:", response)

      // Xử lý và chuyển đổi response
      const result = this.mapApiResponseToResult(response)

      return result
    } catch (error) {
      console.error("Error submitting nutrition check:", error)
      throw error
    }
  }

  // Helper method để chuyển đổi dữ liệu API sang định dạng frontend
  private mapApiResponseToResult(apiResponse: any): NutritionCheckResult {
    // Xử lý dữ liệu từ API và chuyển đổi sang định dạng frontend
    // Dựa vào cấu trúc response từ tài liệu API

    return {
      id: apiResponse._id || `NC-${Date.now()}`,
      name: apiResponse.name || "",
      birthDate: apiResponse.birthday || "",
      weight: String(apiResponse.weight || ""),
      height: String(apiResponse.height || ""),
      phone: apiResponse.phone || "",
      gender: apiResponse.gender === 1 ? "male" : "female",
      bmi: this.calculateBMI(apiResponse.height, apiResponse.weight),
      nutritionStatus: this.getNutritionStatus(apiResponse),
      analysisDate: apiResponse.createAt
        ? new Date(apiResponse.createAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      recommendations: [
        "Bổ sung đủ protein mỗi ngày",
        "Uống đủ nước (2-3 lít/ngày)",
        "Tăng cường rau xanh và trái cây",
      ],
    }
  }

  // Tính BMI
  private calculateBMI(height: number, weight: number): number {
    if (!height || !weight) return 0
    const heightInMeters = height / 100
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10
  }

  // Xác định tình trạng dinh dưỡng
  private getNutritionStatus(data: any): string {
    const bmi = this.calculateBMI(data.height, data.weight)

    if (bmi < 18.5) return "Thiếu cân"
    if (bmi >= 18.5 && bmi < 23) return "Bình thường"
    if (bmi >= 23 && bmi < 25) return "Thừa cân"
    return "Béo phì"
  }
}

// Export a singleton instance
export const nutritionCheckRealService = new NutritionCheckRealService()

