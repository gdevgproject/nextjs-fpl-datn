"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Pencil, Trash2, CheckCircle, MoreVertical, Copy } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UserAddressCardProps {
  address: {
    id: string
    recipient_name: string
    recipient_phone: string
    province_city: string
    district: string
    ward: string
    street_address: string
    is_default: boolean
    created_at: string
    updated_at: string
  }
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
}

export function UserAddressCard({ address, onEdit, onDelete, onSetDefault }: UserAddressCardProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyAddress = () => {
    const fullAddress = `${address.street_address}, ${address.ward}, ${address.district}, ${address.province_city}`
    navigator.clipboard.writeText(fullAddress)
    setIsCopied(true)
    toast({
      title: "Đã sao chép địa chỉ",
      description: "Địa chỉ đã được sao chép vào clipboard",
    })
    setTimeout(() => setIsCopied(false), 2000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
    <Card className={`overflow-hidden transition-all ${address.is_default ? "border-primary" : ""}`}>
      <CardContent className="p-0">
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{address.recipient_name}</span>
                  {address.is_default && (
                    <Badge variant="outline" className="text-xs border-primary text-primary">
                      Mặc định
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{address.recipient_phone}</div>
                <div className="mt-1 text-sm">
                  {address.street_address}, {address.ward}, {address.district}, {address.province_city}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Cập nhật: {formatDate(address.updated_at)}</div>
              </div>
            </div>
            <TooltipProvider>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Mở menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tùy chọn</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyAddress}>
                    <Copy className="mr-2 h-4 w-4" />
                    Sao chép địa chỉ
                  </DropdownMenuItem>
                  {!address.is_default && (
                    <DropdownMenuItem onClick={onSetDefault}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Đặt làm mặc định
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0 gap-2">
        <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
          <Pencil className="mr-2 h-4 w-4" />
          Sửa
        </Button>
        {!address.is_default ? (
          <Button variant="outline" size="sm" onClick={onSetDefault} className="flex-1">
            <CheckCircle className="mr-2 h-4 w-4" />
            Đặt mặc định
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled className="flex-1">
            <CheckCircle className="mr-2 h-4 w-4" />
            Đã là mặc định
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

