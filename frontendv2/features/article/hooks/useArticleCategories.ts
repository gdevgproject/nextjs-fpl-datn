"use client"

import { useQuery } from "@tanstack/react-query"
import { articleService } from "../services/articleServiceFactory"

export function useArticleCategories() {
  return useQuery({
    queryKey: ["articleCategories"],
    queryFn: () => articleService.getArticleCategories(),
  })
}

