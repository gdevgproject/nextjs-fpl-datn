"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Truck, CreditCard, FileText, ShoppingBag, Package } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface OrderConfirmationDetailsProps {
  orderId: string
}

export function OrderConfirmationDetails({ orderId }: OrderConfirmationDetailsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("products")

  // Giả lập dữ liệu đơn hàng
  const orderDetails = {
    id: orderId,
    date: new Date().toLocaleDateString("vi-VN"),
    status: "Đang xử lý",
    paymentStatus: "Chờ thanh toán",
    paymentMethod: "Thanh toán khi nhận hàng (COD)",
    shippingMethod: "Giao hàng tiêu chuẩn",
    estimatedDelivery: "27/03 - 29/03/2025",
    subtotal: 2500000,
    discount: 250000,
    shipping: 0,
    total: 2250000,
    items: [
      {
        id: "item1",
        name: "Chanel Coco Mademoiselle",
        slug: "chanel-coco-mademoiselle",
        brand: "Chanel",
        image: "/placeholder.svg?height=150&width=150",
        price: 3200000,
        salePrice: null,
        volume: "50ml",
        quantity: 1,
      },
      {
        id: "item2",
        name: "Dior Sauvage",
        slug: "dior-sauvage",
        brand: "Dior",
        image: "/placeholder.svg?height=150&width=150",
        price: 2800000,
        salePrice: 2520000,
        volume: "100ml",
        quantity: 1,
      },
    ],
    customer: {
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0901234567",
    },
    shippingAddress: {
      recipientName: "Nguyễn Văn A",
      recipientPhone: "0901234567",
      address: "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
    },
    notes: "Giao hàng trong giờ hành chính",
  }

  // Giả lập loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Tabs defaultValue="products">
          <TabsList className="w-full">
            <Skeleton className="h-10 w-full" />
          </TabsList>
          <div className="mt-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="mt-4 h-32 w-full rounded-lg" />
          </div>
        </Tabs>
      </div>
    )
  }

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full">
        <TabsTrigger value="products" className="flex-1">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Sản phẩm
        </TabsTrigger>
        <TabsTrigger value="shipping" className="flex-1">
          <Truck className="mr-2 h-4 w-4" />
          Giao hàng
        </TabsTrigger>
        <TabsTrigger value="payment" className="flex-1">
          <CreditCard className="mr-2 h-4 w-4" />
          Thanh toán
        </TabsTrigger>
      </TabsList>

      <TabsContent value="products" className="mt-4 space-y-4">
        {orderDetails.items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-start gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
          >
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
              <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              {item.quantity > 1 && (
                <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {item.quantity}
                </div>
              )}
            </div>
            <div className="flex-1">
              <Link href={`/san-pham/${item.slug}`} className="font-medium hover:text-primary">
                {item.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {item.brand} - {item.volume}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-medium">
                  {formatCurrency(item.salePrice || item.price)} x {item.quantity}
                </span>
                {item.salePrice && (
                  <span className="text-xs text-muted-foreground line-through">{formatCurrency(item.price)}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="font-medium">{formatCurrency((item.salePrice || item.price) * item.quantity)}</span>
              <div className="mt-1">
                <Badge variant="outline" className="text-xs">
                  <Package className="mr-1 h-3 w-3" />
                  Đang xử lý
                </Badge>
              </div>
            </div>
          </motion.div>
        ))}

        <Separator className="my-4" />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tạm tính</span>
            <span>{formatCurrency(orderDetails.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Giảm giá</span>
            <span className="text-green-600">
              {orderDetails.discount > 0 ? `-${formatCurrency(orderDetails.discount)}` : formatCurrency(0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phí vận chuyển</span>
            <span>{orderDetails.shipping === 0 ? "Miễn phí" : formatCurrency(orderDetails.shipping)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-medium">
            <span>Tổng cộng</span>
            <span className="text-lg">{formatCurrency(orderDetails.total)}</span>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/san-pham`}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Mua thêm sản phẩm
            </Link>
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="shipping" className="mt-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Địa chỉ giao hàng</h3>
          </div>
          <p className="font-medium">{orderDetails.shippingAddress.recipientName}</p>
          <p>{orderDetails.shippingAddress.recipientPhone}</p>
          <p className="mt-1 text-muted-foreground">{orderDetails.shippingAddress.address}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-lg border p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Phương thức vận chuyển</h3>
          </div>
          <p>{orderDetails.shippingMethod}</p>
          <p className="mt-1 text-sm text-muted-foreground">Dự kiến giao: {orderDetails.estimatedDelivery}</p>
        </motion.div>

        {orderDetails.notes && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-lg border p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Ghi chú đơn hàng</h3>
            </div>
            <p className="text-muted-foreground">{orderDetails.notes}</p>
          </motion.div>
        )}
      </TabsContent>

      <TabsContent value="payment" className="mt-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Phương thức thanh toán</h3>
          </div>
          <p>{orderDetails.paymentMethod}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Trạng thái: <span className="font-medium text-amber-600">{orderDetails.paymentStatus}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-lg border p-4"
        >
          <h3 className="mb-2 font-medium">Thông tin khách hàng</h3>
          <p>{orderDetails.customer.name}</p>
          <p>{orderDetails.customer.email}</p>
          <p>{orderDetails.customer.phone}</p>
        </motion.div>
      </TabsContent>
    </Tabs>
  )
}

