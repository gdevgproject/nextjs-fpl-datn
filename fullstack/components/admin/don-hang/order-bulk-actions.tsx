"use client"

import { CheckCircle, Truck, Package, XCircle, Printer, Mail, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface OrderBulkActionsProps {
  selectedCount: number
  onClearSelection: () => void
}

export default function OrderBulkActions({ selectedCount, onClearSelection }: OrderBulkActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden md:inline-block">Đã chọn {selectedCount} đơn hàng</span>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onClearSelection}>
          Bỏ chọn
        </Button>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Package className="mr-2 h-4 w-4 text-amber-500" />
            Đang xử lý
          </Button>

          <Button variant="outline" size="sm">
            <Truck className="mr-2 h-4 w-4 text-blue-500" />
            Đang giao hàng
          </Button>

          <Button variant="outline" size="sm">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            Đã giao hàng
          </Button>

          <Button variant="outline" size="sm">
            <XCircle className="mr-2 h-4 w-4 text-red-500" />
            Hủy đơn hàng
          </Button>
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Cập nhật trạng thái</DropdownMenuLabel>
              <DropdownMenuItem>
                <Package className="mr-2 h-4 w-4 text-amber-500" />
                Đang xử lý
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Truck className="mr-2 h-4 w-4 text-blue-500" />
                Đang giao hàng
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Đã giao hàng
              </DropdownMenuItem>
              <DropdownMenuItem>
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                Hủy đơn hàng
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Printer className="mr-2 h-4 w-4" />
                In đơn hàng
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" />
                Gửi email
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

