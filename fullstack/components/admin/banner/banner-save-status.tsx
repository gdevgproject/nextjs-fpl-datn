"use client"

import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Clock } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BannerSaveStatusProps {
  lastSaved: Date | null
  autoSaveEnabled: boolean
  onToggleAutoSave: () => void
  formChanged: boolean
}

export function BannerSaveStatus({ lastSaved, autoSaveEnabled, onToggleAutoSave, formChanged }: BannerSaveStatusProps) {
  return (
    <div className="flex items-center space-x-4 text-sm">
      {lastSaved && (
        <div className="flex items-center text-muted-foreground">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>Đã lưu lúc {format(lastSaved, "HH:mm:ss", { locale: vi })}</span>
        </div>
      )}

      {formChanged && !lastSaved && <div className="text-muted-foreground">Chưa lưu</div>}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground hidden sm:inline-block">Tự động lưu</span>
              <Switch checked={autoSaveEnabled} onCheckedChange={onToggleAutoSave} size="sm" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tự động lưu form sau mỗi 30 giây khi có thay đổi</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

