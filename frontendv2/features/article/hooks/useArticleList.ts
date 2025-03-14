"use client"

import { useQuery } from "@tanstack/react-query"
import { articleService } from "../services/articleServiceFactory"
import type { ArticleListParams } from "../types/articleTypes"

export function useArticleList(params?: ArticleListParams) {
  return useQuery({
    queryKey: ["articles", params],
    queryFn: () => articleService.getArticles(params),
  })
}

