"use client"

import { useState } from "react"
import { ArrowLeft, Check, Receipt, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OrderRefundProcessProps {
  orderId: string
  totalAmount: number
  paymentMethod: string
  onBack: () => void
}

export function OrderRefundProcess({ orderId, totalAmount, paymentMethod, onBack }: OrderRefundProcessProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [refundType, setRefundType] = useState("full")
  const [refundAmount, setRefundAmount] = useState(totalAmount.toString())
  const [refundMethod, setRefundMethod] = useState(
    paymentMethod === "COD" ? "bank_transfer" : paymentMethod.toLowerCase(),
  )
  const [refundReason, setRefundReason] = useState("customer_request")
  const [refundNote, setRefundNote] = useState("")

  // Xử lý khi thay đổi loại hoàn tiền
  const handleRefundTypeChange = (value: string) => {
    setRefundType(value)
    if (value === "full") {
      setRefundAmount(totalAmount.toString())
    } else {
      setRefundAmount("")
    }
  }

  // Xử lý khi xác nhận hoàn tiền
  const handleRefund = () => {
    setIsProcessing(true)

    // Giả lập xử lý hoàn tiền
    setTimeout(() => {
      setIsProcessing(false)

      toast({
        title: "Hoàn tiền thành công",
        description: `Đã xử lý hoàn tiền cho đơn hàng #${orderId}`,
      })

      onBack()
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại</span>
          </Button>
          <div>
            <CardTitle>Xử lý hoàn tiền</CardTitle>
            <CardDescription>Hoàn tiền cho đơn hàng #{orderId}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2">
          <Label>Loại hoàn tiền</Label>
          <RadioGroup value={refundType} onValueChange={handleRefundTypeChange} className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="full" id="full-refund" />
              <Label htmlFor="full-refund" className="font-normal">
                Hoàn tiền toàn bộ
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="partial" id="partial-refund" />
              <Label htmlFor="partial-refund" className="font-normal">
                Hoàn tiền một phần
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="refund-amount">Số tiền hoàn trả</Label>
          <div className="relative">
            <Input
              id="refund-amount"
              type="number"
              min="0"
              max={totalAmount}
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              disabled={refundType === "full"}
              className="pr-12"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
              VND
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Tổng giá trị đơn hàng: {new Intl.NumberFormat("vi-VN").format(totalAmount)} VND
          </p>
        </div>

        <Separator />

        <Tabs defaultValue="payment-info">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payment-info">Thông tin thanh toán</TabsTrigger>
            <TabsTrigger value="reason">Lý do hoàn tiền</TabsTrigger>
          </TabsList>
          <TabsContent value="payment-info" className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="refund-method">Phương thức hoàn tiền</Label>
              <Select value={refundMethod} onValueChange={setRefundMethod}>
                <SelectTrigger id="refund-method">
                  <SelectValue placeholder="Chọn phương thức hoàn tiền" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Chuyển khoản ngân hàng</SelectItem>
                  <SelectItem value="momo">Ví MoMo</SelectItem>
                  <SelectItem value="zalopay">ZaloPay</SelectItem>
                  <SelectItem value="vnpay">VNPay</SelectItem>
                  <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {refundMethod === "bank_transfer" && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="bank-name">Tên ngân hàng</Label>
                  <Input id="bank-name" placeholder="Nhập tên ngân hàng" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="account-number">Số tài khoản</Label>
                  <Input id="account-number" placeholder="Nhập số tài khoản" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="account-name">Tên chủ tài khoản</Label>
                  <Input id="account-name" placeholder="Nhập tên chủ tài khoản" />
                </div>
              </div>
            )}

            {(refundMethod === "momo" || refundMethod === "zalopay") && (
              <div className="grid gap-2">
                <Label htmlFor="wallet-phone">Số điện thoại ví</Label>
                <Input id="wallet-phone" placeholder="Nhập số điện thoại ví" />
              </div>
            )}
          </TabsContent>
          <TabsContent value="reason" className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="refund-reason">Lý do hoàn tiền</Label>
              <Select value={refundReason} onValueChange={setRefundReason}>
                <SelectTrigger id="refund-reason">
                  <SelectValue placeholder="Chọn lý do hoàn tiền" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_request">Khách hàng yêu cầu hủy</SelectItem>
                  <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                  <SelectItem value="shipping_issue">Vấn đề vận chuyển</SelectItem>
                  <SelectItem value="product_damaged">Sản phẩm bị hỏng</SelectItem>
                  <SelectItem value="wrong_product">Sản phẩm không đúng</SelectItem>
                  <SelectItem value="other">Lý do khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="refund-note">Ghi chú</Label>
              <Textarea
                id="refund-note"
                placeholder="Nhập ghi chú về việc hoàn tiền (nếu có)"
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Receipt className="h-4 w-4" />
            <span>Tạo phiếu hoàn tiền</span>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} disabled={isProcessing}>
            <X className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          <Button onClick={handleRefund} disabled={isProcessing} className="gap-2">
            {isProcessing ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Xác nhận hoàn tiền</span>
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

