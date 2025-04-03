"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Truck, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface OrderTrackingLinkProps {
  orderId: string
}

export function OrderTrackingLink({ orderId }: OrderTrackingLinkProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [trackingEmail, setTrackingEmail] = useState("")
  const [trackingPhone, setTrackingPhone] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleClick = () => {
    // Nếu người dùng đã đăng nhập, chuyển hướng trực tiếp
    // Nếu chưa đăng nhập, hiển thị dialog để nhập thông tin
    const isLoggedIn = false // Giả lập trạng thái đăng nhập

    if (isLoggedIn) {
      setIsLoading(true)
      // Giả lập chuyển hướng đến trang theo dõi đơn hàng
      setTimeout(() => {
        router.push(`/tai-khoan/don-hang/${orderId}`)
      }, 1000)
    } else {
      setIsDialogOpen(true)
    }
  }

  const handleTrackOrder = () => {
    if (!trackingEmail && !trackingPhone) {
      toast({
        title: "Thông tin không hợp lệ",
        description: "Vui lòng nhập email hoặc số điện thoại để theo dõi đơn hàng",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setIsDialogOpen(false)

    // Giả lập kiểm tra thông tin và chuyển hướng
    setTimeout(() => {
      router.push(
        `/don-hang/theo-doi/${orderId}?email=${encodeURIComponent(trackingEmail)}&phone=${encodeURIComponent(trackingPhone)}`,
      )
    }, 1000)
  }

  return (
    <>
      <Button onClick={handleClick} className="gap-2" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Đang chuyển hướng...</span>
          </>
        ) : (
          <>
            <Truck className="h-4 w-4" />
            <span>Theo dõi đơn hàng</span>
          </>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Theo dõi đơn hàng</DialogTitle>
            <DialogDescription>Nhập thông tin để theo dõi đơn hàng của bạn</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tracking-email">Email</Label>
              <Input
                id="tracking-email"
                type="email"
                placeholder="Email đặt hàng"
                value={trackingEmail}
                onChange={(e) => setTrackingEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tracking-phone">Số điện thoại</Label>
              <Input
                id="tracking-phone"
                type="tel"
                placeholder="Số điện thoại đặt hàng"
                value={trackingPhone}
                onChange={(e) => setTrackingPhone(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">Nhập email hoặc số điện thoại bạn đã sử dụng khi đặt hàng</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleTrackOrder} className="gap-1">
              <ExternalLink className="h-4 w-4" />
              Theo dõi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

