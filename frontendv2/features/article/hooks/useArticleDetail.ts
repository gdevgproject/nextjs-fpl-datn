"use client"

import { useQuery } from "@tanstack/react-query"
import { articleService } from "../services/articleServiceFactory"

export function useArticleDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: () => articleService.getArticleBySlug(slug as string),
    enabled: !!slug,
  })
}

