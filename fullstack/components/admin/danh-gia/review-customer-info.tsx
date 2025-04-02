import { format } from "date-fns"
import { vi } from "date-fns/locale"
import Link from "next/link"
import { ShoppingBag, CreditCard, Star } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

interface ReviewCustomerInfoProps {
  customer: any // Trong thực tế, bạn sẽ có type cụ thể
}

export function ReviewCustomerInfo({ customer }: ReviewCustomerInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin khách hàng</CardTitle>
        <CardDescription>Chi tiết về khách hàng đã viết đánh giá</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20">
            <AvatarImage src={customer.avatar} alt={customer.name} />
            <AvatarFallback className="text-2xl">{customer.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-bold">{customer.name}</h3>
            <p className="text-muted-foreground">{customer.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Khách hàng từ {format(new Date(customer.memberSince), "dd/MM/yyyy", { locale: vi })}
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/nguoi-dung/${customer.id}`}>Xem hồ sơ</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/nguoi-dung/${customer.id}/don-hang`}>Xem đơn hàng</Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg border p-4">
            <ShoppingBag className="mb-2 h-5 w-5 text-primary" />
            <span className="text-xl font-bold">{customer.totalOrders}</span>
            <span className="text-sm text-muted-foreground">Đơn hàng</span>
          </div>

          <div className="flex flex-col items-center rounded-lg border p-4">
            <CreditCard className="mb-2 h-5 w-5 text-primary" />
            <span className="text-xl font-bold">
              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(customer.totalSpent)}
            </span>
            <span className="text-sm text-muted-foreground">Tổng chi tiêu</span>
          </div>

          <div className="flex flex-col items-center rounded-lg border p-4">
            <Star className="mb-2 h-5 w-5 text-primary" />
            <span className="text-xl font-bold">4.5</span>
            <span className="text-sm text-muted-foreground">Đánh giá trung bình</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

