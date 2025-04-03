import Image from "next/image"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface BannerPreviewProps {
  title: string
  subtitle?: string
  imageUrl: string
}

export function BannerPreview({ title, subtitle, imageUrl }: BannerPreviewProps) {
  const hasContent = title || subtitle

  return (
    <div className="space-y-4">
      <div className="relative rounded-md overflow-hidden border">
        {imageUrl ? (
          <>
            <div className="aspect-[3/1] relative">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt={title || "Banner preview"}
                fill
                className="object-cover"
              />
            </div>
            {hasContent && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center p-4 sm:p-8">
                {title && <h3 className="text-xl sm:text-2xl font-bold text-white">{title}</h3>}
                {subtitle && <p className="text-white/80 mt-2">{subtitle}</p>}
              </div>
            )}
          </>
        ) : (
          <div className="aspect-[3/1] bg-gray-100 flex items-center justify-center">
            <p className="text-muted-foreground">Chưa có hình ảnh</p>
          </div>
        )}
      </div>

      {!hasContent && imageUrl && (
        <Alert variant="default" className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Banner không có tiêu đề hoặc tiêu đề phụ. Bạn có thể thêm nội dung để banner hấp dẫn hơn.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

