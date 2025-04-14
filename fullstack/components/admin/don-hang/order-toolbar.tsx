"use client"

import {
  List,
  LayoutGrid,
  CalendarIcon,
  Filter,
  Download,
  RefreshCcw,
  CheckCircle,
  XCircle,
  Truck,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMediaQuery } from "@/hooks/use-media-query"

interface OrderToolbarProps {
  view: "list" | "kanban" | "calendar"
  onViewChange: (view: "list" | "kanban" | "calendar") => void
  onToggleFilter: () => void
  selectedCount: number
}

export default function OrderToolbar({ view, onViewChange, onToggleFilter, selectedCount }: OrderToolbarProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className="flex items-center space-x-2">
      {selectedCount > 0 ? (
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Cập nhật trạng thái
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            In đơn hàng
          </Button>
        </div>
      ) : (
        <>
          <div className="hidden md:flex items-center space-x-1 border rounded-md">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={view === "list" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 px-2 rounded-none rounded-l-md"
                    onClick={() => onViewChange("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Xem dạng danh sách</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={view === "kanban" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 px-2 rounded-none"
                    onClick={() => onViewChange("kanban")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Xem dạng kanban</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={view === "calendar" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 px-2 rounded-none rounded-r-md"
                    onClick={() => onViewChange("calendar")}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Xem dạng lịch</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onToggleFilter}>
                  <Filter className="h-4 w-4 mr-2" />
                  {isMobile ? "" : "Lọc"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lọc đơn hàng</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {isMobile ? "" : "Xuất"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Xuất CSV</DropdownMenuItem>
              <DropdownMenuItem>Xuất Excel</DropdownMenuItem>
              <DropdownMenuItem>Xuất PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Làm mới</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  )
}

function Printer({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="6 9 6 2 18 2 18 9"></polyline>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
  )
}

