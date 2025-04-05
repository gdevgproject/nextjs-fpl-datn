"use client"

import { useState, useEffect } from "react"
import { useCheckout } from "../../providers/checkout-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone } from "lucide-react"

export function GuestInfo() {
  const { guestInfo, setGuestInfo } = useCheckout()
  const [name, setName] = useState(guestInfo?.name || "")
  const [email, setEmail] = useState(guestInfo?.email || "")
  const [phone, setPhone] = useState(guestInfo?.phone || "")

  // Update guest info in checkout context when fields change
  useEffect(() => {
    if (name || email || phone) {
      setGuestInfo({
        name,
        email,
        phone,
      })
    }
  }, [name, email, phone, setGuestInfo])

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Thông tin người mua
        </CardTitle>
        <CardDescription>Vui lòng nhập thông tin của bạn để tiếp tục thanh toán</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Họ và tên</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="name"
                placeholder="Nguyễn Văn A"
                className="pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="phone"
                placeholder="0912345678"
                className="pl-10"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

