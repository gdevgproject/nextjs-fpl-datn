import type { NutritionCheckFormData, NutritionCheckResult, NutritionCheckService } from "../types/nutritionCheckTypes"

export class NutritionCheckMockService implements NutritionCheckService {
  async submitNutritionCheck(data: NutritionCheckFormData): Promise<NutritionCheckResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Simulate error probability (10%)
    if (Math.random() < 0.1) {
      throw new Error("Có lỗi xảy ra khi xử lý dữ liệu. Vui lòng thử lại sau.")
    }

    // Return mock result
    return {
      id: `NC-${Date.now()}`,
      ...data,
      submittedAt: new Date().toISOString(),
    }
  }
}

// Export a singleton instance
export const nutritionCheckMockService = new NutritionCheckMockService()

