import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface BrandPreviewProps {
  name: string
  description?: string
  logo: string | null
  isFeatured: boolean
  origin?: string
  foundedYear?: string
  productCount: number
}

export function BrandPreview({
  name,
  description,
  logo,
  isFeatured,
  origin,
  foundedYear,
  productCount,
}: BrandPreviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Xem trước</CardTitle>
          <CardDescription>Xem trước thương hiệu trên website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <div className="relative aspect-[3/1] w-full bg-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                {logo ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-md bg-background p-1">
                    <Image
                      src={logo || "/placeholder.svg"}
                      alt={name || "Logo thương hiệu"}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed bg-background">
                    <span className="text-xs text-muted-foreground">Logo</span>
                  </div>
                )}
              </div>
              {isFeatured && (
                <div className="absolute right-2 top-2">
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">
                    <Star className="mr-1 h-3 w-3 fill-white" /> Nổi bật
                  </Badge>
                </div>
              )}
            </div>
            <div className="space-y-2 p-4">
              <h3 className="text-lg font-semibold">{name || "Tên thương hiệu"}</h3>

              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {origin && <span>Xuất xứ: {origin}</span>}
                {origin && foundedYear && <span>•</span>}
                {foundedYear && <span>Thành lập: {foundedYear}</span>}
                {(origin || foundedYear) && <span>•</span>}
                <span>{productCount} sản phẩm</span>
              </div>

              <p className="text-sm">{description || "Mô tả thương hiệu sẽ hiển thị ở đây..."}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hiển thị trên trang chủ</CardTitle>
          <CardDescription>Xem trước hiển thị trên trang chủ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg border">
            <div className="relative aspect-square w-full bg-muted">
              <div className="absolute inset-0 flex items-center justify-center">
                {logo ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-md bg-background p-1">
                    <Image
                      src={logo || "/placeholder.svg"}
                      alt={name || "Logo thương hiệu"}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed bg-background">
                    <span className="text-xs text-muted-foreground">Logo</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-2 text-center">
              <h3 className="font-medium">{name || "Tên thương hiệu"}</h3>
              <p className="text-xs text-muted-foreground">{productCount} sản phẩm</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

