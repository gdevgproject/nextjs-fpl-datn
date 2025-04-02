import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Clock, CheckCircle, XCircle, MessageCircle, Eye, AlertTriangle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface HistoryItem {
  action: string
  timestamp: string
  user: string
  details?: string
}

interface ReviewHistoryProps {
  history: HistoryItem[]
}

export function ReviewHistory({ history }: ReviewHistoryProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "replied":
        return <MessageCircle className="h-4 w-4 text-purple-500" />
      case "viewed":
        return <Eye className="h-4 w-4 text-gray-500" />
      case "deleted":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case "created":
        return "Đánh giá được tạo"
      case "approved":
        return "Đánh giá được duyệt"
      case "rejected":
        return "Đánh giá bị từ chối"
      case "replied":
        return "Shop đã phản hồi"
      case "viewed":
        return "Admin đã xem"
      case "deleted":
        return "Đánh giá bị xóa"
      default:
        return action
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử hoạt động</CardTitle>
        <CardDescription>Lịch sử các thao tác với đánh giá này</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border" />

            {history.map((item, index) => (
              <div key={index} className="mb-4 relative">
                <div className="absolute -left-4 mt-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background border">
                  {getActionIcon(item.action)}
                </div>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{getActionText(item.action)}</h4>
                    <time className="text-xs text-muted-foreground">
                      {format(new Date(item.timestamp), "HH:mm 'ngày' dd/MM/yyyy", { locale: vi })}
                    </time>
                  </div>
                  <p className="mt-1 text-sm">Thực hiện bởi: {item.user}</p>
                  {item.details && <p className="mt-1 text-sm text-muted-foreground">{item.details}</p>}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

