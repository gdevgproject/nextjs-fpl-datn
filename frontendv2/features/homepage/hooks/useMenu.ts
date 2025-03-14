"use client"

import { useState, useEffect } from "react"
import { menuApi, type MenuItem, type MenuCategory, type BestSellingProduct } from "@/services/api/menuApi"

export function useMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [bestSellingProducts, setBestSellingProducts] = useState<BestSellingProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchMenuData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [menuItemsData, categoriesData, productsData] = await Promise.all([
          menuApi.getMenuItems(),
          menuApi.getCategories(),
          menuApi.getBestSellingProducts(),
        ])

        setMenuItems(menuItemsData)
        setCategories(categoriesData)
        setBestSellingProducts(productsData)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuData()
  }, [])

  return {
    menuItems,
    categories,
    bestSellingProducts,
    isLoading,
    error,
  }
}

