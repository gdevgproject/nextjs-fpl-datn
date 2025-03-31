import Image from "next/image"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star } from "lucide-react"

interface OrderItemsProps {
  items: {
    id: number
    product_name: string
    variant: string
    quantity: number
    price: number
    image: string
    product_id?: number
    is_in_stock?: boolean
  }[]
}

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Sản phẩm đã mua</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start space-x-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                <Image src={item.image || "/placeholder.svg"} alt={item.product_name} fill className="object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">
                      <Link href={`/san-pham/${item.product_id || "#"}`} className="hover:underline">
                        {item.product_name}
                      </Link>
                    </h4>
                    <p className="text-sm text-muted-foreground">Phân loại: {item.variant}</p>
                  </div>
                  <p className="text-sm font-medium">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Số lượng: {item.quantity}</p>
                  <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    {item.is_in_stock !== undefined && (
                      <Badge variant={item.is_in_stock ? "outline" : "secondary"} className="text-xs">
                        {item.is_in_stock ? "Còn hàng" : "Hết hàng"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Star className="mr-1 h-4 w-4" />
                      <span className="text-xs">Đánh giá</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <ShoppingCart className="mr-1 h-4 w-4" />
                      <span className="text-xs">Mua lại</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

