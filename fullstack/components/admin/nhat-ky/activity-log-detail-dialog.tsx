"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ActivityTypeBadge } from "./activity-type-badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface ActivityLogDetailDialogProps {
  log: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActivityLogDetailDialog({ log, open, onOpenChange }: ActivityLogDetailDialogProps) {
  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chi tiết hoạt động</DialogTitle>
          <DialogDescription>Thông tin chi tiết về hoạt động được thực hiện</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Thời gian</p>
              <p className="text-sm">{format(log.timestamp, "HH:mm - dd/MM/yyyy", { locale: vi })}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Loại hoạt động</p>
              <ActivityTypeBadge type={log.activity_type} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Mô tả</p>
            <p className="text-sm">{log.description}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Người thực hiện</p>
            <p className="text-sm">{log.admin_user_name}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-2">Chi tiết thay đổi</p>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

