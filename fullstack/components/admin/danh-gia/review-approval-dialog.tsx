"use client"

import { useState } from "react"
import { Check, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface ReviewApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reviewId: string
}

export function ReviewApprovalDialog({ open, onOpenChange, reviewId }: ReviewApprovalDialogProps) {
  const [note, setNote] = useState("")
  const [sendNotification, setSendNotification] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [approvalType, setApprovalType] = useState("simple")
  const [featuredStatus, setFeaturedStatus] = useState("none")

  const handleApprove = async () => {
    if (!reviewId) return

    setIsSubmitting(true)

    try {
      // Xử lý duyệt đánh giá (sẽ được thêm logic sau)
      console.log("Approving review:", reviewId, {
        note,
        sendNotification,
        approvalType,
        featuredStatus,
      })

      // Giả lập xử lý backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Đã duyệt đánh giá",
        description: "Đánh giá đã được duyệt thành công.",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error approving review:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi duyệt đánh giá. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Duyệt đánh giá</span>
          </DialogTitle>
          <DialogDescription>
            Đánh giá sẽ được hiển thị công khai trên trang sản phẩm sau khi được duyệt.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="simple" value={approvalType} onValueChange={setApprovalType}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">Duyệt đơn giản</TabsTrigger>
            <TabsTrigger value="advanced">Tùy chọn nâng cao</TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="note">Ghi chú nội bộ (không hiển thị cho khách hàng)</Label>
              <Textarea
                id="note"
                placeholder="Nhập ghi chú nội bộ (không bắt buộc)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-notification"
                checked={sendNotification}
                onCheckedChange={(checked) => setSendNotification(checked as boolean)}
              />
              <Label htmlFor="send-notification">Gửi email thông báo cho khách hàng</Label>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Đánh dấu đánh giá</Label>
              <RadioGroup value={featuredStatus} onValueChange={setFeaturedStatus}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">Không đánh dấu</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="featured" id="featured" />
                  <Label htmlFor="featured">Đánh giá nổi bật</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="helpful" id="helpful" />
                  <Label htmlFor="helpful">Đánh giá hữu ích</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="advanced-note">Ghi chú nội bộ</Label>
              <Textarea
                id="advanced-note"
                placeholder="Nhập ghi chú nội bộ (không bắt buộc)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="advanced-send-notification"
                checked={sendNotification}
                onCheckedChange={(checked) => setSendNotification(checked as boolean)}
              />
              <Label htmlFor="advanced-send-notification">Gửi email thông báo cho khách hàng</Label>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleApprove} disabled={isSubmitting} className="gap-1">
            <Check className="h-4 w-4" />
            <span>{isSubmitting ? "Đang xử lý..." : "Duyệt đánh giá"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

