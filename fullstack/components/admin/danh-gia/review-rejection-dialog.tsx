"use client"

import { useState } from "react"
import { X, XCircle } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ReviewRejectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reviewId: string
}

export function ReviewRejectionDialog({ open, onOpenChange, reviewId }: ReviewRejectionDialogProps) {
  const [reason, setReason] = useState("inappropriate")
  const [customReason, setCustomReason] = useState("")
  const [note, setNote] = useState("")
  const [sendNotification, setSendNotification] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rejectionType, setRejectionType] = useState("simple")

  const handleReject = async () => {
    if (!reviewId) return

    setIsSubmitting(true)

    try {
      // Xử lý từ chối đánh giá (sẽ được thêm logic sau)
      console.log("Rejecting review:", reviewId, {
        reason,
        customReason,
        note,
        sendNotification,
        rejectionType,
      })

      // Giả lập xử lý backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Đã từ chối đánh giá",
        description: "Đánh giá đã bị từ chối thành công.",
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error rejecting review:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi từ chối đánh giá. Vui lòng thử lại.",
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
            <XCircle className="h-5 w-5 text-red-500" />
            <span>Từ chối đánh giá</span>
          </DialogTitle>
          <DialogDescription>Đánh giá sẽ không được hiển thị trên trang sản phẩm sau khi bị từ chối.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="simple" value={rejectionType} onValueChange={setRejectionType}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">Từ chối đơn giản</TabsTrigger>
            <TabsTrigger value="advanced">Tùy chọn nâng cao</TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>Lý do từ chối</Label>
              <RadioGroup value={reason} onValueChange={setReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate" id="inappropriate" />
                  <Label htmlFor="inappropriate">Nội dung không phù hợp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spam" id="spam" />
                  <Label htmlFor="spam">Spam hoặc quảng cáo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fake" id="fake" />
                  <Label htmlFor="fake">Đánh giá giả mạo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Lý do khác</Label>
                </div>
              </RadioGroup>
            </div>

            {reason === "other" && (
              <div className="grid gap-2">
                <Label htmlFor="custom-reason">Lý do cụ thể</Label>
                <Textarea
                  id="custom-reason"
                  placeholder="Nhập lý do cụ thể"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            )}

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
              <Label>Lý do từ chối</Label>
              <RadioGroup value={reason} onValueChange={setReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate" id="advanced-inappropriate" />
                  <Label htmlFor="advanced-inappropriate">Nội dung không phù hợp</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="spam" id="advanced-spam" />
                  <Label htmlFor="advanced-spam">Spam hoặc quảng cáo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fake" id="advanced-fake" />
                  <Label htmlFor="advanced-fake">Đánh giá giả mạo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="irrelevant" id="advanced-irrelevant" />
                  <Label htmlFor="advanced-irrelevant">Không liên quan đến sản phẩm</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="offensive" id="advanced-offensive" />
                  <Label htmlFor="advanced-offensive">Ngôn ngữ xúc phạm</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="advanced-other" />
                  <Label htmlFor="advanced-other">Lý do khác</Label>
                </div>
              </RadioGroup>
            </div>

            {reason === "other" && (
              <div className="grid gap-2">
                <Label htmlFor="advanced-custom-reason">Lý do cụ thể</Label>
                <Textarea
                  id="advanced-custom-reason"
                  placeholder="Nhập lý do cụ thể"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            )}

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
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isSubmitting || (reason === "other" && !customReason.trim())}
            className="gap-1"
          >
            <X className="h-4 w-4" />
            <span>{isSubmitting ? "Đang xử lý..." : "Từ chối đánh giá"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

