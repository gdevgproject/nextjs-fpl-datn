"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface LogsTableProps {
  logs: any[]
  onViewDetails: (log: any) => void
}

export function LogsTable({ logs, onViewDetails }: LogsTableProps) {
  // Function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: vi,
      })
    } catch (error) {
      return "Không xác định"
    }
  }

  // Function to get activity type badge color
  const getActivityTypeColor = (type: string) => {
    if (type.includes("CREATE") || type.includes("INSERT")) return "bg-green-500"
    if (type.includes("UPDATE")) return "bg-blue-500"
    if (type.includes("DELETE")) return "bg-red-500"
    if (type.includes("CANCEL")) return "bg-orange-500"
    if (type.includes("APPROVE")) return "bg-emerald-500"
    return "bg-gray-500"
  }

  // Function to get entity type badge color
  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case "product":
      case "products":
        return "bg-indigo-500"
      case "order":
      case "orders":
        return "bg-amber-500"
      case "review":
      case "reviews":
        return "bg-purple-500"
      case "user":
      case "users":
      case "profile":
      case "profiles":
        return "bg-cyan-500"
      case "brand":
      case "brands":
        return "bg-pink-500"
      case "category":
      case "categories":
        return "bg-teal-500"
      default:
        return "bg-slate-500"
    }
  }

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Thời gian</TableHead>
            <TableHead className="w-[180px]">Người thực hiện</TableHead>
            <TableHead className="w-[150px]">Loại hoạt động</TableHead>
            <TableHead className="w-[120px]">Đối tượng</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead className="w-[80px] text-right">Chi tiết</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium whitespace-nowrap">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col">
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{new Date(log.timestamp).toLocaleString("vi-VN")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <span className="text-muted-foreground">{log.admin_user_id || "Không xác định"}</span>
              </TableCell>
              <TableCell>
                <Badge
                  className={`${getActivityTypeColor(log.activity_type)} hover:${getActivityTypeColor(
                    log.activity_type,
                  )}`}
                >
                  {log.activity_type}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`${getEntityTypeColor(log.entity_type)} hover:${getEntityTypeColor(
                    log.entity_type,
                  )} text-white border-0`}
                >
                  {log.entity_type}
                </Badge>
              </TableCell>
              <TableCell className="max-w-md truncate">{log.description}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onViewDetails(log)} title="Xem chi tiết">
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
