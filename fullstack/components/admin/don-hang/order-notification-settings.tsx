"use client"

import { useState } from "react"
import { Check, Mail, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface OrderNotificationSettingsProps {
  orderId: string
  customerEmail: string
  orderStatus: string
}

export function OrderNotificationSettings({ orderId, customerEmail, orderStatus }: OrderNotificationSettingsProps) {
  const [open, setOpen] = useState(false)
  const [includeItems, setIncludeItems] = useState(true)
  const [includeTracking, setIncludeTracking] = useState(true)
  const [includePaymentInfo, setIncludePaymentInfo] = useState(true)
  const [additionalMessage, setAdditionalMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  // Mẫu nội dung email dựa trên trạng thái đơn hàng
  const getDefaultEmailContent = () => {
    switch (orderStatus) {
      case "Processing":
        return "Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ thông báo khi đơn hàng được giao cho đơn vị vận chuyển."
      case "Shipped":
        return "Đơn hàng của bạn đã được giao cho đơn vị vận chuyển. Bạn có thể theo dõi đơn hàng bằng mã vận đơn được cung cấp."
      case "Delivered":
        return "Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm tại MyBeauty!"
      case "Cancelled":
        return "Đơn hàng của bạn đã bị hủy theo yêu cầu. Nếu bạn đã thanh toán, chúng tôi sẽ hoàn tiền trong vòng 3-5 ngày làm việc."
      default:
        return "Cập nhật về đơn hàng của bạn tại MyBeauty."
    }
  }

  const handleSendEmail = async () => {
    setIsSending(true)

    // Giả lập gửi email
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSending(false)
    setOpen(false)

    toast({
      title: "Email đã được gửi",
      description: `Email thông báo đã được gửi đến ${customerEmail}`,
      duration: 3000,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" />
          <span>Gửi email thông báo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gửi email thông báo</DialogTitle>
          <DialogDescription>Gửi email thông báo cập nhật trạng thái đơn hàng đến khách hàng</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Người nhận</p>
            <p className="text-sm">{customerEmail}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Tiêu đề</p>
            <p className="text-sm">
              Cập nhật đơn hàng #{orderId} - {orderStatus}
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="preview">
              <AccordionTrigger>Xem trước nội dung email</AccordionTrigger>
              <AccordionContent>
                <div className="rounded-md border p-3 text-sm">
                  <p>Kính gửi Quý khách,</p>
                  <p className="mt-2">{getDefaultEmailContent()}</p>
                  {additionalMessage && <p className="mt-2">{additionalMessage}</p>}

                  {includeItems && (
                    <div className="mt-4">
                      <p className="font-medium">Thông tin đơn hàng:</p>
                      <ul className="list-disc pl-5 mt-1">
                        <li>Dior Sauvage EDP (100ml) - 1 x 2.150.000đ</li>
                        <li>Chanel Bleu de Chanel EDP (50ml) - 1 x 1.850.000đ</li>
                      </ul>
                    </div>
                  )}

                  {includeTracking && orderStatus === "Shipped" && (
                    <div className="mt-4">
                      <p className="font-medium">Thông tin vận chuyển:</p>
                      <p className="mt-1">Mã vận đơn: GHNTK123456789</p>
                      <p>Đơn vị vận chuyển: Giao hàng nhanh</p>
                      <p>Dự kiến giao hàng: 2-3 ngày làm việc</p>
                    </div>
                  )}

                  {includePaymentInfo && (
                    <div className="mt-4">
                      <p className="font-medium">Thông tin thanh toán:</p>
                      <p className="mt-1">Phương thức: Chuyển khoản ngân hàng</p>
                      <p>Trạng thái: Đã thanh toán</p>
                    </div>
                  )}

                  <p className="mt-4">
                    Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.
                  </p>
                  <p className="mt-2">Trân trọng,</p>
                  <p>Đội ngũ MyBeauty</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="space-y-2">
            <p className="text-sm font-medium">Thông tin bổ sung</p>
            <Textarea
              placeholder="Nhập thông tin bổ sung (nếu có)"
              value={additionalMessage}
              onChange={(e) => setAdditionalMessage(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Tùy chọn nội dung</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-items"
                  checked={includeItems}
                  onCheckedChange={(checked) => setIncludeItems(!!checked)}
                />
                <label
                  htmlFor="include-items"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Bao gồm danh sách sản phẩm
                </label>
              </div>

              {orderStatus === "Shipped" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-tracking"
                    checked={includeTracking}
                    onCheckedChange={(checked) => setIncludeTracking(!!checked)}
                  />
                  <label
                    htmlFor="include-tracking"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Bao gồm thông tin vận chuyển
                  </label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-payment"
                  checked={includePaymentInfo}
                  onCheckedChange={(checked) => setIncludePaymentInfo(!!checked)}
                />
                <label
                  htmlFor="include-payment"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Bao gồm thông tin thanh toán
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSending}>
            <X className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          <Button onClick={handleSendEmail} disabled={isSending}>
            {isSending ? (
              <>
                <span className="mr-2">Đang gửi...</span>
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Gửi email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

