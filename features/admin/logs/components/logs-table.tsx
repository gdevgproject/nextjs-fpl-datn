"use client";

import { memo, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserEmails } from "../hooks/use-user-emails";
import type { AdminActivityLog } from "../types";

interface LogsTableProps {
  logs: AdminActivityLog[];
  onViewDetails: (log: AdminActivityLog) => void;
}

// Thành phần con cho mỗi dòng trong bảng, được tối ưu với memo
const LogRow = memo(function LogRow({
  log,
  onViewDetails,
  email,
  cancelledByUserEmail,
  isLoadingEmail,
}: {
  log: AdminActivityLog;
  onViewDetails: (log: AdminActivityLog) => void;
  email: string | undefined;
  cancelledByUserEmail: string | undefined;
  isLoadingEmail: boolean;
}) {
  // Tính toán các giá trị cần thiết bên trong component memoized để tránh render lại
  const timestamp = useMemo(
    () => formatTimestamp(log.timestamp),
    [log.timestamp]
  );
  const activityTypeColor = getActivityTypeColor(log.activity_type);
  const entityTypeColor = getEntityTypeColor(log.entity_type);

  // Kiểm tra xem có phải là hành động hủy đơn hàng không
  const isOrderCancellation = useMemo(() => {
    return (
      log.activity_type.includes("ORDER_CANCELLED") ||
      (log.entity_type === "orders" && log.activity_type.includes("CANCEL"))
    );
  }, [log.activity_type, log.entity_type]);

  // Lấy email người thực hiện, ưu tiên lấy từ cancelled_by_user_id nếu có
  const performerEmail = useMemo(() => {
    // Nếu là hành động hủy đơn hàng và có details
    if (
      isOrderCancellation &&
      log.details &&
      log.details.cancelled_by_user_id
    ) {
      return cancelledByUserEmail || log.details.cancelled_by_user_id;
    }
    return isLoadingEmail ? "Đang tải..." : email || log.admin_user_id;
  }, [
    isLoadingEmail,
    email,
    cancelledByUserEmail,
    log.admin_user_id,
    isOrderCancellation,
    log.details,
  ]);

  // Xử lý sự kiện click với useCallback để tránh tạo lại hàm
  const handleViewDetails = useCallback(() => {
    onViewDetails(log);
  }, [log, onViewDetails]);

  return (
    <TableRow key={log.id}>
      <TableCell className="font-medium whitespace-nowrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col">
                <span>{timestamp}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{new Date(log.timestamp).toLocaleString("vi-VN")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <div className="flex flex-col space-y-1">
          <span className="font-medium text-sm">{performerEmail}</span>
          <span className="text-muted-foreground text-xs">
            {log.description}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`${activityTypeColor} hover:${activityTypeColor}`}>
          {log.activity_type}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={`${entityTypeColor} hover:${entityTypeColor} text-white border-0`}
        >
          {log.entity_type}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleViewDetails}
          title="Xem chi tiết"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});

export function LogsTable({ logs, onViewDetails }: LogsTableProps) {
  // Lấy danh sách userIds từ admin_user_id
  const adminUserIds = useMemo(
    () => logs.map((log) => log.admin_user_id).filter(Boolean),
    [logs]
  );

  // Lấy danh sách userIds từ cả cancelled_by_user_id trong details
  const cancelledByUserIds = useMemo(() => {
    const ids: string[] = [];
    logs.forEach((log) => {
      if (
        log.details &&
        log.details.cancelled_by_user_id &&
        typeof log.details.cancelled_by_user_id === "string"
      ) {
        ids.push(log.details.cancelled_by_user_id);
      }
    });
    return ids;
  }, [logs]);

  // Kết hợp cả hai danh sách ID để lấy email trong một lần fetch
  const allUserIds = useMemo(() => {
    const uniqueIds = new Set([...adminUserIds, ...cancelledByUserIds]);
    return Array.from(uniqueIds);
  }, [adminUserIds, cancelledByUserIds]);

  // Fetch user emails - hook đã được tối ưu để tái sử dụng cache
  const { data: userEmails, isLoading: isLoadingEmails } =
    useUserEmails(allUserIds);

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Thời gian</TableHead>
            <TableHead className="w-[250px]">Người thực hiện & Mô tả</TableHead>
            <TableHead className="w-[150px]">Loại hoạt động</TableHead>
            <TableHead className="w-[120px]">Đối tượng</TableHead>
            <TableHead className="w-[80px] text-right">Chi tiết</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <LogRow
              key={log.id}
              log={log}
              onViewDetails={onViewDetails}
              email={userEmails?.[log.admin_user_id]}
              cancelledByUserEmail={
                log.details?.cancelled_by_user_id
                  ? userEmails?.[log.details.cancelled_by_user_id]
                  : undefined
              }
              isLoadingEmail={isLoadingEmails}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Function để định dạng timestamp
function formatTimestamp(timestamp: string) {
  try {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: vi,
    });
  } catch (error) {
    return "Không xác định";
  }
}

// Function để lấy màu badge theo loại hoạt động
function getActivityTypeColor(type: string) {
  if (type.includes("CREATE") || type.includes("INSERT")) return "bg-green-500";
  if (type.includes("UPDATE")) return "bg-blue-500";
  if (type.includes("DELETE")) return "bg-red-500";
  if (type.includes("CANCEL")) return "bg-orange-500";
  if (type.includes("APPROVE")) return "bg-emerald-500";
  return "bg-gray-500";
}

// Function để lấy màu badge theo loại đối tượng
function getEntityTypeColor(type: string) {
  switch (type) {
    case "product":
    case "products":
      return "bg-indigo-500";
    case "order":
    case "orders":
      return "bg-amber-500";
    case "review":
    case "reviews":
      return "bg-purple-500";
    case "user":
    case "users":
    case "profile":
    case "profiles":
      return "bg-cyan-500";
    case "brand":
    case "brands":
      return "bg-pink-500";
    case "category":
    case "categories":
      return "bg-teal-500";
    default:
      return "bg-slate-500";
  }
}
