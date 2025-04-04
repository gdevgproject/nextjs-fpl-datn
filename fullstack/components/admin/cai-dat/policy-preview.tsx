"use client"

import { Card, CardContent } from "@/components/ui/card"

interface PolicyPreviewProps {
  content: string
}

export function PolicyPreview({ content }: PolicyPreviewProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </CardContent>
    </Card>
  )
}

