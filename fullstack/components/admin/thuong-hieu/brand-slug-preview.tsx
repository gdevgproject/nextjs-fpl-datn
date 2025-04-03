import { Globe } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface BrandSlugPreviewProps {
  slug: string
}

export function BrandSlugPreview({ slug }: BrandSlugPreviewProps) {
  const baseUrl = "https://mybeauty.com/thuong-hieu/"
  const fullUrl = `${baseUrl}${slug}`

  return (
    <Alert>
      <Globe className="h-4 w-4" />
      <AlertTitle>URL thương hiệu</AlertTitle>
      <AlertDescription className="mt-1 flex flex-wrap items-center gap-1 font-mono text-sm">
        <span className="text-muted-foreground">{baseUrl}</span>
        <span className="font-medium">{slug || "..."}</span>
      </AlertDescription>
    </Alert>
  )
}

