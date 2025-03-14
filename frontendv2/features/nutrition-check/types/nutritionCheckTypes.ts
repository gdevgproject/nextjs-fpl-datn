// Types for nutrition check feature
export interface NutritionCheckFormData {
  name: string
  birthDate: string
  regularFoods: string[]
  knownProduct: "yes" | "no"
}

export interface NutritionCheckResult {
  id: string
  name: string
  birthDate: string
  regularFoods: string[]
  knownProduct: "yes" | "no"
  submittedAt: string
}

export interface NutritionCheckService {
  submitNutritionCheck(data: NutritionCheckFormData): Promise<NutritionCheckResult>
}

