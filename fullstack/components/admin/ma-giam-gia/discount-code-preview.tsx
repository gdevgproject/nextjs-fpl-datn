"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"

interface DiscountCodePreviewProps {
  code: string
  discountPercentage: number
  maxDiscountAmount?: number
  minOrderValue: number
  startDate: Date
  endDate: Date
  isActive: boolean
}

export function DiscountCodePreview({
  code,
  discountPercentage,
  maxDiscountAmount,
  minOrderValue,
  startDate,
  endDate,
  isActive,
}: DiscountCodePreviewProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Đã sao chép mã giảm giá",
      description: `Mã ${code} đã được sao chép vào clipboard.`,
    })
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <Badge variant={isActive ? "success" : "secondary"} className="mb-2">
            {isActive ? "Đang hoạt động" : "Không hoạt động"}
          </Badge>

          <div className="relative mb-2">
            <div className="absolute -left-2 -right-2 top-1/2 h-[1px] bg-border" />
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-background border" />
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-background border" />

            <div className="relative bg-background px-2 py-1 border rounded-md">
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold tracking-wider">{code || "SUMMER2023"}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sao chép mã</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <div className="text-2xl font-bold text-primary">Giảm {discountPercentage}%</div>

          {maxDiscountAmount && (
            <div className="text-sm text-muted-foreground">
              Tối đa {new Intl.NumberFormat("vi-VN").format(maxDiscountAmount)}đ
            </div>
          )}

          <div className="mt-2 text-sm">Cho đơn từ {new Intl.NumberFormat("vi-VN").format(minOrderValue)}đ</div>

          <div className="mt-4 text-xs text-muted-foreground">
            Hiệu lực từ {format(startDate, "dd/MM/yyyy", { locale: vi })} đến{" "}
            {format(endDate, "dd/MM/yyyy", { locale: vi })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

