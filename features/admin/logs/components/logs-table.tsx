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
  isLoadingEmail,
}: {
  log: AdminActivityLog;
  onViewDetails: (log: AdminActivityLog) => void;
  email: string | undefined;
  isLoadingEmail: boolean;
}) {
  // Tính toán các giá trị cần thiết bên trong component memoized để tránh render lại
  const timestamp = useMemo(
    () => formatTimestamp(log.timestamp),
    [log.timestamp]
  );
  const activityTypeColor = getActivityTypeColor(log.activity_type);
  const entityTypeColor = getEntityTypeColor(log.entity_type);
  
  // Format email để hiển thị ngắn gọn hơn
  const formattedEmail = useMemo(() => {
    if (isLoadingEmail) return "Đang tải...";
    if (!email) return log.admin_user_id;
    const parts = email.split('@');
    return parts[0];
  }, [email, isLoadingEmail, log.admin_user_id]);

  // Xử lý sự kiện click với useCallback để tránh tạo lại hàm
  const handleViewDetails = useCallback(() => {
    onViewDetails(log);
  }, [log, onViewDetails]);

  return (
    <TableRow key={log.id}>
      <TableCell className="font-medium whitespace-nowrap w-[150px]">
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
      
      <TableCell className="w-[220px]">
        <div className="flex flex-col gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-medium">
                  {formattedEmail}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{email || log.admin_user_id}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <span className="text-xs text-muted-foreground line-clamp-2">
            {log.description}
          </span>
        </div>
      </TableCell>
      
      <TableCell className="w-[130px]">
        <Badge 
          className={`${activityTypeColor} hover:${activityTypeColor}`}
          variant="outline"
        >
          {formatActivityType(log.activity_type)}
        </Badge>
      </TableCell>
      
      <TableCell className="w-[120px]">
        <Badge
          variant="outline"
          className={`${entityTypeColor} hover:${entityTypeColor} text-white border-0`}
        >
          {log.entity_type}
        </Badge>
      </TableCell>
      
      <TableCell className="w-[100px] text-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleViewDetails}
                className="h-8 w-8"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Xem chi tiết</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
});

export function LogsTable({ logs, onViewDetails }: LogsTableProps) {
  // Lấy danh sách userIds từ logs
  const userIds = useMemo(
    () => logs.map((log) => log.admin_user_id).filter(Boolean),
    [logs]
  );

  // Fetch user emails - hook đã được tối ưu để tái sử dụng cache
  const { data: userEmails, isLoading: isLoadingEmails } =
    useUserEmails(userIds);

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thời gian</TableHead>
            <TableHead>Người thực hiện & Mô tả</TableHead>
            <TableHead>Loại hoạt động</TableHead>
            <TableHead>Đối tượng</TableHead>
            <TableHead className="text-center">Chi tiết</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <LogRow
              key={log.id}
              log={log}
              onViewDetails={onViewDetails}
              email={userEmails?.[log.admin_user_id]}
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

// Function định dạng loại hoạt động để hiển thị thân thiện hơn
function formatActivityType(type: string) {
  // Loại bỏ prefix thường gặp để hiển thị ngắn gọn hơn
  const formattedType = type
    .replace(/PRODUCT_|CATEGORY_|ORDER_|BRAND_|USER_/, '')
    .replace(/_/g, ' ');
    
  // Chuyển đổi các hành động phổ biến sang tiếng Việt
  switch (formattedType) {
    case 'INSERT': return 'Thêm mới';
    case 'UPDATE': return 'Cập nhật';
    case 'DELETE': return 'Xóa';
    case 'CREATE': return 'Tạo mới';
    case 'APPROVE': return 'Duyệt';
    case 'REJECT': return 'Từ chối';
    case 'CANCEL': return 'Hủy';
    default: return formattedType;
  }
}

// Function để lấy màu badge theo loại hoạt động
function getActivityTypeColor(type: string) {
  if (type.includes("CREATE") || type.includes("INSERT")) return "bg-green-500";
  if (type.includes("UPDATE")) return "bg-blue-500";
  if (type.includes("DELETE")) return "bg-red-500";
  if (type.includes("CANCEL")) return "bg-orange-500";
  if (type.includes("APPROVE")) return "bg-emerald-500";
  if (type.includes("REJECT")) return "bg-rose-500";
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
    case "banner":
    case "banners":
      return "bg-orange-500";
    case "discount":
    case "discounts":
      return "bg-yellow-500";
    case "payment":
    case "payments":
      return "bg-lime-500";
    case "inventory":
      return "bg-emerald-500";
    default:
      return "bg-slate-500";
  }
}
