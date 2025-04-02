"use client"

import type React from "react"

import { useState } from "react"
import { Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ReviewReplyFormProps {
  reviewId: string
  onCancel: () => void
  onSubmit: (content: string) => Promise<void>
  isSubmitting: boolean
}

export function ReviewReplyForm({ reviewId, onCancel, onSubmit, isSubmitting }: ReviewReplyFormProps) {
  const [content, setContent] = useState("")
  const [sendEmail, setSendEmail] = useState(true)
  const [useTemplate, setUseTemplate] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      await onSubmit(content)
    }
  }

  const handleUseTemplate = () => {
    setUseTemplate(true)
    setContent(
      "Cảm ơn bạn đã đánh giá sản phẩm của chúng tôi. Chúng tôi rất vui khi bạn hài lòng với sản phẩm và dịch vụ của shop. Mong rằng bạn sẽ tiếp tục ủng hộ shop trong tương lai.",
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Phản hồi đánh giá</CardTitle>
        <CardDescription>Phản hồi của bạn sẽ được hiển thị công khai dưới đánh giá của khách hàng</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="reply-content">Nội dung phản hồi</Label>
            <Textarea
              id="reply-content"
              placeholder="Nhập nội dung phản hồi..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="send-email"
              checked={sendEmail}
              onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="send-email" className="text-sm">
              Gửi email thông báo cho khách hàng
            </Label>
          </div>

          {!useTemplate && (
            <Button type="button" variant="outline" size="sm" onClick={handleUseTemplate} disabled={isSubmitting}>
              Sử dụng mẫu phản hồi
            </Button>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="gap-1">
            <X className="h-4 w-4" />
            <span>Hủy</span>
          </Button>
          <Button type="submit" disabled={isSubmitting || !content.trim()} className="gap-1">
            <Send className="h-4 w-4" />
            <span>{isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

