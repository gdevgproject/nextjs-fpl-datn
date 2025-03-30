"use client"

import type React from "react"

import { useState } from "react"
import { Section } from "@/components/layout/section"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      toast({
        title: "Đăng ký thành công!",
        description: "Cảm ơn bạn đã đăng ký nhận thông tin khuyến mãi từ chúng tôi.",
      })
      setEmail("")

      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000)
    }, 1500)
  }

  return (
    <Section className="py-12 md:py-16 bg-muted/50">
      <div className="max-w-3xl mx-auto text-center">
        <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Đăng ký nhận tin</h2>
        <p className="text-muted-foreground mb-6 md:mb-8">
          Nhận thông tin về khuyến mãi, sản phẩm mới và các sự kiện đặc biệt
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
            disabled={isLoading || isSuccess}
          />
          <Button type="submit" disabled={isLoading || isSuccess} className="w-full sm:w-auto">
            {isLoading ? (
              "Đang đăng ký..."
            ) : isSuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Đã đăng ký
              </>
            ) : (
              "Đăng ký"
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-4">
          Chúng tôi cam kết bảo mật thông tin của bạn. Xem thêm{" "}
          <a href="/chinh-sach/bao-mat" className="underline hover:text-primary">
            Chính sách bảo mật
          </a>
          .
        </p>
      </div>
    </Section>
  )
}

