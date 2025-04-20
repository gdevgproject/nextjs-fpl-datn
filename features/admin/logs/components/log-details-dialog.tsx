import { memo, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { JsonView } from "./json-view";
import { useUserEmails } from "../hooks/use-user-emails";
import type { AdminActivityLog } from "../types";

interface LogDetailsDialogProps {
  log: AdminActivityLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Memoize component để tránh re-render không cần thiết
export const LogDetailsDialog = memo(function LogDetailsDialog({
  log,
  open,
  onOpenChange,
}: LogDetailsDialogProps) {
  // Fetch user email - dùng hook đã tối ưu với caching
  const { data: userEmails, isLoading: isLoadingEmails } = useUserEmails(
    log?.admin_user_id ? [log.admin_user_id] : []
  );

  // Memoize các giá trị phái sinh để tránh tính toán lại nếu props không đổi
  const activityTypeColor = useMemo(
    () => getActivityTypeColor(log.activity_type),
    [log.activity_type]
  );
  const formattedTimestamp = useMemo(
    () => new Date(log.timestamp).toLocaleString("vi-VN"),
    [log.timestamp]
  );
  const adminEmail = useMemo(() => {
    if (!log.admin_user_id) return "Không xác định";
    if (isLoadingEmails) return "Đang tải...";
    return userEmails?.[log.admin_user_id] || log.admin_user_id;
  }, [log.admin_user_id, userEmails, isLoadingEmails]);

  // Parse JSON details một lần duy nhất
  const parsedDetails = useMemo(() => {
    if (!log.details) return null;
    try {
      return typeof log.details === "string"
        ? JSON.parse(log.details)
        : log.details;
    } catch (error) {
      console.error("Error parsing log details:", error);
      return log.details;
    }
  }, [log.details]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết hoạt động
            <Badge
              className={`${activityTypeColor} hover:${activityTypeColor} ml-2`}
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
              <p className="text-sm">{formattedTimestamp}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Người thực hiện</h4>
              <p className="text-sm">{adminEmail}</p>
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
            {parsedDetails ? (
              <JsonView data={parsedDetails} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Không có dữ liệu chi tiết
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

// Function để lấy màu badge theo loại hoạt động
function getActivityTypeColor(type: string) {
  if (type.includes("CREATE") || type.includes("INSERT")) return "bg-green-500";
  if (type.includes("UPDATE")) return "bg-blue-500";
  if (type.includes("DELETE")) return "bg-red-500";
  if (type.includes("CANCEL")) return "bg-orange-500";
  if (type.includes("APPROVE")) return "bg-emerald-500";
  return "bg-gray-500";
}
