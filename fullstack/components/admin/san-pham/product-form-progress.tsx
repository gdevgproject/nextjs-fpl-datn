"use client"

import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProductFormProgressProps {
  progress: number
  errors?: number
  warnings?: number
}

export function ProductFormProgress({ progress, errors = 0, warnings = 0 }: ProductFormProgressProps) {
  // Hiển thị màu dựa trên tiến trình và lỗi
  const getProgressColor = () => {
    if (errors > 0) return "bg-red-500"
    if (warnings > 0) return "bg-amber-500"
    if (progress < 50) return "bg-blue-500"
    if (progress < 80) return "bg-blue-600"
    return "bg-green-500"
  }

  // Hiển thị icon dựa trên tiến trình và lỗi
  const getStatusIcon = () => {
    if (errors > 0) return <AlertCircle className="h-4 w-4 text-red-500" />
    if (warnings > 0) return <AlertTriangle className="h-4 w-4 text-amber-500" />
    if (progress >= 100) return <CheckCircle className="h-4 w-4 text-green-500" />
    return null
  }

  // Hiển thị thông báo dựa trên tiến trình và lỗi
  const getStatusMessage = () => {
    if (errors > 0) return `${errors} lỗi cần sửa`
    if (warnings > 0) return `${warnings} cảnh báo`
    if (progress < 50) return "Đang bắt đầu"
    if (progress < 80) return "Đang tiến triển"
    if (progress < 100) return "Gần hoàn thành"
    return "Hoàn thành"
  }

  // Hiển thị tooltip dựa trên tiến trình và lỗi
  const getTooltipMessage = () => {
    if (errors > 0) return "Sản phẩm có lỗi cần sửa trước khi lưu"
    if (warnings > 0) return "Sản phẩm có cảnh báo, có thể lưu nhưng nên kiểm tra lại"
    if (progress < 50) return "Sản phẩm đang trong giai đoạn bắt đầu, cần điền thêm thông tin"
    if (progress < 80) return "Sản phẩm đang được điền thông tin, tiếp tục hoàn thiện"
    if (progress < 100) return "Sản phẩm gần hoàn thành, chỉ còn một vài thông tin tùy chọn"
    return "Sản phẩm đã hoàn thành, sẵn sàng để lưu"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex w-full max-w-xs flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Tiến trình</div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                {getStatusIcon()}
                <span>{progress}%</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={progress} className="h-2" indicatorClassName={getProgressColor()} />
              <span className="text-xs text-muted-foreground">{getStatusMessage()}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipMessage()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

