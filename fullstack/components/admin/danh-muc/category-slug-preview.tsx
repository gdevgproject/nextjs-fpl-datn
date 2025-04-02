"use client"

import { Badge } from "@/components/ui/badge"

interface CategorySlugPreviewProps {
  slug: string
}

export function CategorySlugPreview({ slug }: CategorySlugPreviewProps) {
  const baseUrl = "https://mybeauty.vn/danh-muc/"

  return (
    <div className="mt-1.5">
      <p className="text-sm text-muted-foreground mb-1">URL hiển thị:</p>
      <div className="flex items-center">
        <Badge variant="outline" className="font-mono text-xs">
          {baseUrl}
          <span className="font-bold text-primary">{slug || "..."}</span>
        </Badge>
      </div>
    </div>
  )
}

