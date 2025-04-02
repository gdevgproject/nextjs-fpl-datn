"use client"

import { Check, MessageSquare, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReviewActionBarProps {
  status: "pending" | "approved" | "rejected"
  hasReply: boolean
  onApprove: () => void
  onReject: () => void
  onReply: () => void
  onDelete: () => void
}

export function ReviewActionBar({ status, hasReply, onApprove, onReject, onReply, onDelete }: ReviewActionBarProps) {
  return (
    <div className="flex items-center gap-2">
      {status === "pending" ? (
        <>
          <Button variant="outline" onClick={onReject} className="gap-1">
            <X className="h-4 w-4" />
            <span>Từ chối</span>
          </Button>
          <Button onClick={onApprove} className="gap-1">
            <Check className="h-4 w-4" />
            <span>Duyệt đánh giá</span>
          </Button>
        </>
      ) : (
        <Button variant="outline" onClick={onReply} className="gap-1">
          <MessageSquare className="h-4 w-4" />
          <span>{hasReply ? "Xem phản hồi" : "Phản hồi"}</span>
        </Button>
      )}
      <Button variant="destructive" onClick={onDelete} size="icon">
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Xóa đánh giá</span>
      </Button>
    </div>
  )
}

