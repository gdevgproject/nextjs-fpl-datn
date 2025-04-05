"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

export function ActivityLogExport() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = (format: string) => {
    setIsExporting(true)

    // Giả lập quá trình export
    setTimeout(() => {
      setIsExporting(false)
      toast({
        title: "Xuất báo cáo thành công",
        description: `Báo cáo đã được xuất dưới dạng ${format.toUpperCase()}`,
      })
    }, 1500)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Đang xuất..." : "Xuất báo cáo"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>Xuất CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>Xuất Excel</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

