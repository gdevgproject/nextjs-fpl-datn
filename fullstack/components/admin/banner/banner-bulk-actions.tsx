"use client"

import { Check, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface BannerBulkActionsProps {
  selectedCount: number
  onAction: (action: string) => void
  onClearSelection: () => void
}

export function BannerBulkActions({ selectedCount, onAction, onClearSelection }: BannerBulkActionsProps) {
  return (
    <div className="bg-muted/50 p-2 rounded-md flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Đã chọn {selectedCount} banner</span>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X className="h-4 w-4 mr-1" />
          Bỏ chọn
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Thao tác
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAction("activate")}>
              <Check className="h-4 w-4 mr-2" />
              Kích hoạt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("deactivate")}>
              <X className="h-4 w-4 mr-2" />
              Vô hiệu hóa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("delete")} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="default" size="sm" onClick={() => onAction("activate")}>
          <Check className="h-4 w-4 mr-1" />
          Kích hoạt
        </Button>
        <Button variant="outline" size="sm" onClick={() => onAction("deactivate")}>
          <X className="h-4 w-4 mr-1" />
          Vô hiệu hóa
        </Button>
      </div>
    </div>
  )
}

