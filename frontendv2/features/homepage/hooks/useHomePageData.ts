"use client"

import { useQuery } from "@tanstack/react-query"
import { productApi } from "@/services/api/productApi" // Assuming you have this
import { articleApi } from "@/services/api/articleApi" // Assuming you have this
import { bannerApi } from "@/services/api/bannerApi" // Assuming you have this

export function useHomePageData() {
  const bestSellingProductsQuery = useQuery({
    queryKey: ["bestSellingProducts"],
    queryFn: () => productApi.getBestSellingProducts(),
  })

  const featuredArticlesQuery = useQuery({
    queryKey: ["featuredArticles"],
    queryFn: () => articleApi.getFeaturedArticles(),
  })

  const bannersQuery = useQuery({
    queryKey: ["homeBanners"],
    queryFn: () => bannerApi.getHomeBanners(),
  })

  const isLoading = bestSellingProductsQuery.isLoading || featuredArticlesQuery.isLoading || bannersQuery.isLoading

  const error = bestSellingProductsQuery.error || featuredArticlesQuery.error || bannersQuery.error

  return {
    bestSellingProducts: bestSellingProductsQuery.data || [],
    featuredArticles: featuredArticlesQuery.data || [],
    banners: bannersQuery.data || [],
    isLoading,
    error,
  }
}

