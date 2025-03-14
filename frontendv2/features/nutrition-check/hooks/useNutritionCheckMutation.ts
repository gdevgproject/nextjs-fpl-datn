"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { nutritionCheckService } from "../services/nutritionCheckServiceFactory"
import type { NutritionCheckFormData, NutritionCheckResult } from "../types/nutritionCheckTypes"

export function useNutritionCheckMutation() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (formData: NutritionCheckFormData) => nutritionCheckService.submitNutritionCheck(formData),
    onSuccess: (data: NutritionCheckResult) => {
      // Save result to cache
      queryClient.setQueryData(["nutritionCheck", data.id], data)

      // Redirect to results page
      router.push(`/nutrition-check/results?id=${data.id}`)
    },
  })
}

// Hook to get nutrition check result from cache
export function useNutritionCheckResult(id: string | undefined) {
  const queryClient = useQueryClient()

  if (!id) return null

  // Get data from cache
  return queryClient.getQueryData<NutritionCheckResult>(["nutritionCheck", id])
}

