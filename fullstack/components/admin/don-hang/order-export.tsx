"use client"

import { Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function OrderExport() {
  const handleExport = (format: string) => {
    // Xử lý export ở đây
    console.log(`Exporting to ${format}...`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>Export CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("excel")}>Export Excel</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>Export PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

