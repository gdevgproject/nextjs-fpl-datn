"use client"

import { useQueries } from "@tanstack/react-query"
import { menuService } from "../services/menuServiceFactory"
import type { MenuItem, MenuCategory, BestSellingProduct } from "../types/menuTypes"

export function useMenu() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["menuItems"],
        queryFn: () => menuService.getMenuItems(),
      },
      {
        queryKey: ["menuCategories"],
        queryFn: () => menuService.getCategories(),
      },
      {
        queryKey: ["menuBestSellingProducts"],
        queryFn: () => menuService.getBestSellingProducts(),
      },
    ],
  })

  const isLoading = results.some((result) => result.isLoading)
  const error = results.find((result) => result.error)?.error || null

  return {
    menuItems: (results[0].data as MenuItem[]) || [],
    categories: (results[1].data as MenuCategory[]) || [],
    bestSellingProducts: (results[2].data as BestSellingProduct[]) || [],
    isLoading,
    error,
  }
}

