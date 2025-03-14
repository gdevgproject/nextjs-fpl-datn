"use client"

import { useQuery } from "@tanstack/react-query"
import { articleService } from "../services/articleServiceFactory"

export function useRelatedArticles(slug: string | undefined, limit = 3) {
  return useQuery({
    queryKey: ["relatedArticles", slug, limit],
    queryFn: () => articleService.getRelatedArticles(slug as string, limit),
    enabled: !!slug,
  })
}

