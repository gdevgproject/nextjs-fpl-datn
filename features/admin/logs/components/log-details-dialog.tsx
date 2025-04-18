import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { JsonView } from "./json-view"

interface LogDetailsDialogProps {
  log: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogDetailsDialog({ log, open, onOpenChange }: LogDetailsDialogProps) {
  // Function to get activity type badge color
  const getActivityTypeColor = (type: string) => {
    if (type.includes("CREATE") || type.includes("INSERT")) return "bg-green-500"
    if (type.includes("UPDATE")) return "bg-blue-500"
    if (type.includes("DELETE")) return "bg-red-500"
    if (type.includes("CANCEL")) return "bg-orange-500"
    if (type.includes("APPROVE")) return "bg-emerald-500"
    return "bg-gray-500"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết hoạt động
            <Badge
              className={`${getActivityTypeColor(log.activity_type)} hover:${getActivityTypeColor(
                log.activity_type,
              )} ml-2`}
            >
              {log.activity_type}
            </Badge>
          </DialogTitle>
          <DialogDescription>{log.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Thời gian</h4>
              <p className="text-sm">{new Date(log.timestamp).toLocaleString("vi-VN")}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Người thực hiện</h4>
              <p className="text-sm">{log.admin_user_id || "Không xác định"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Loại đối tượng</h4>
              <p className="text-sm">{log.entity_type}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">ID đối tượng</h4>
              <p className="text-sm">{log.entity_id || "Không có"}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">Chi tiết dữ liệu</h4>
            {log.details ? (
              <JsonView data={typeof log.details === "string" ? JSON.parse(log.details) : log.details} />
            ) : (
              <p className="text-sm text-muted-foreground">Không có dữ liệu chi tiết</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
