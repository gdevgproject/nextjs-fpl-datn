"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ActivityTypeBadge } from "./activity-type-badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ActivityLogDetailDialogEnhancedProps {
  log: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActivityLogDetailDialogEnhanced({ log, open, onOpenChange }: ActivityLogDetailDialogEnhancedProps) {
  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chi tiết hoạt động</DialogTitle>
          <DialogDescription>Thông tin chi tiết về hoạt động được thực hiện</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="details">Chi tiết</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 py-4">
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
              <p className="text-sm font-medium">Dữ liệu thay đổi</p>
              <ScrollArea className="h-[150px] rounded-md border p-4">
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 py-4">
            <div className="space-y-4">
              {log.details &&
                Object.entries(log.details).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm font-medium text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                    {typeof value === "object" ? (
                      <ScrollArea className="h-[100px] rounded-md border p-2 mt-1">
                        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                      </ScrollArea>
                    ) : (
                      <p className="text-sm">{String(value)}</p>
                    )}
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

