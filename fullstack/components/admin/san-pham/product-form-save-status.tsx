"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Save, CheckCircle, Clock, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

interface ProductFormSaveStatusProps {
  lastSaved: Date | null
  isDirty?: boolean
  isAutosaveEnabled?: boolean
  onSave?: () => void
  onToggleAutosave?: () => void
}

export function ProductFormSaveStatus({
  lastSaved,
  isDirty = false,
  isAutosaveEnabled = true,
  onSave,
  onToggleAutosave,
}: ProductFormSaveStatusProps) {
  const [countdown, setCountdown] = useState(30)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Đếm ngược thời gian tự động lưu
  useEffect(() => {
    if (!isAutosaveEnabled || !isDirty) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Tự động lưu khi đếm ngược về 0
          handleAutosave()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isAutosaveEnabled, isDirty])

  // Xử lý tự động lưu
  const handleAutosave = () => {
    if (!isDirty || !isAutosaveEnabled) return

    setIsSaving(true)

    // Giả lập lưu dữ liệu
    setTimeout(() => {
      setIsSaving(false)
      if (onSave) onSave()

      toast({
        title: "Đã lưu tự động",
        description: "Thông tin sản phẩm đã được lưu tự động.",
        variant: "default",
      })
    }, 1000)
  }

  // Xử lý lưu thủ công
  const handleManualSave = () => {
    setIsSaving(true)

    // Giả lập lưu dữ liệu
    setTimeout(() => {
      setIsSaving(false)
      if (onSave) onSave()

      toast({
        title: "Đã lưu",
        description: "Thông tin sản phẩm đã được lưu thành công.",
        variant: "default",
      })
    }, 1000)
  }

  // Xử lý bật/tắt tự động lưu
  const handleToggleAutosave = () => {
    if (onToggleAutosave) onToggleAutosave()
  }

  // Hiển thị trạng thái lưu
  const renderSaveStatus = () => {
    if (isSaving) {
      return (
        <div className="flex items-center text-muted-foreground">
          <Save className="mr-2 h-4 w-4 animate-pulse" />
          <span>Đang lưu...</span>
        </div>
      )
    }

    if (!lastSaved) {
      return (
        <div className="flex items-center text-muted-foreground">
          <Clock className="mr-2 h-4 w-4" />
          <span>Chưa lưu</span>
        </div>
      )
    }

    return (
      <div className="flex items-center text-muted-foreground">
        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
        <span>Đã lưu lúc {format(lastSaved, "HH:mm:ss", { locale: vi })}</span>
      </div>
    )
  }

  // Hiển thị trạng thái tự động lưu
  const renderAutosaveStatus = () => {
    if (!isAutosaveEnabled) {
      return (
        <div className="flex items-center text-muted-foreground">
          <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
          <span>Tự động lưu: Tắt</span>
        </div>
      )
    }

    if (!isDirty) {
      return (
        <div className="flex items-center text-muted-foreground">
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          <span>Không có thay đổi</span>
        </div>
      )
    }

    return (
      <div className="flex items-center text-muted-foreground">
        <Clock className="mr-2 h-4 w-4" />
        <span>Tự động lưu sau {countdown}s</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-x-4 sm:space-y-0">
      <div className="text-sm">{renderSaveStatus()}</div>

      <div className="flex items-center space-x-2">
        <div className="text-sm">{renderAutosaveStatus()}</div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleToggleAutosave} className="h-8 px-2">
                {isAutosaveEnabled ? "Tắt tự động" : "Bật tự động"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isAutosaveEnabled ? "Tắt tự động lưu" : "Bật tự động lưu mỗi 30 giây"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSave}
                disabled={isSaving || (!isDirty && lastSaved !== null)}
                className="h-8"
              >
                <Save className="mr-2 h-4 w-4" />
                Lưu
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {!isDirty && lastSaved !== null ? "Không có thay đổi để lưu" : "Lưu thủ công"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}

