import Image from "next/image"
import Link from "next/link"
import { Tag, Package, Bookmark } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ReviewProductInfoProps {
  product: any // Trong thực tế, bạn sẽ có type cụ thể
}

export function ReviewProductInfo({ product }: ReviewProductInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin sản phẩm</CardTitle>
        <CardDescription>Chi tiết về sản phẩm được đánh giá</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative h-40 w-40 overflow-hidden rounded-md border">
            <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold">{product.name}</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {product.category}
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {product.brand}
              </Badge>
            </div>

            <div className="mt-2 text-sm">
              <p className="flex items-center gap-1 text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>Phiên bản: {product.variant}</span>
              </p>
              <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>
                  Giá: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                </span>
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/san-pham/${product.id}`}>Xem sản phẩm</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/san-pham/${product.id}/danh-gia`}>Xem tất cả đánh giá</Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="mb-2 font-medium flex items-center gap-1">
            <Bookmark className="h-4 w-4 text-primary" />
            <span>Các đánh giá khác cho sản phẩm này</span>
          </h4>

          <div className="grid grid-cols-5 gap-2 text-center">
            <div className="rounded-md border p-2">
              <div className="text-lg font-bold">4.5</div>
              <div className="text-xs text-muted-foreground">Trung bình</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-lg font-bold">12</div>
              <div className="text-xs text-muted-foreground">5 sao</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-lg font-bold">8</div>
              <div className="text-xs text-muted-foreground">4 sao</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-lg font-bold">3</div>
              <div className="text-xs text-muted-foreground">3 sao</div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-lg font-bold">1</div>
              <div className="text-xs text-muted-foreground">1-2 sao</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

