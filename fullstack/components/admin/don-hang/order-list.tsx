"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Eye, Edit, Trash2, Printer, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OrderStatusBadge } from "@/components/admin/don-hang/order-status-badge"
import { PaymentStatusBadge } from "@/components/admin/don-hang/payment-status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useMediaQuery } from "@/hooks/use-media-query"
import OrderQuickView from "@/components/admin/don-hang/order-quick-view"
import OrderBulkActions from "@/components/admin/don-hang/order-bulk-actions"

// Mẫu dữ liệu đơn hàng
const orders = [
  {
    id: "ORD-001",
    orderDate: new Date("2023-06-01"),
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@example.com",
    customerAvatar: "",
    orderStatus: "Pending",
    paymentStatus: "Pending",
    paymentMethod: "COD",
    totalAmount: 1250000,
    items: 3,
    shippingAddress: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    notes: "Gọi trước khi giao hàng",
    trackingNumber: "",
  },
  {
    id: "ORD-002",
    orderDate: new Date("2023-06-02"),
    customerName: "Trần Thị B",
    customerEmail: "tranthib@example.com",
    customerAvatar: "",
    orderStatus: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "Banking",
    totalAmount: 2150000,
    items: 5,
    shippingAddress: "456 Đường Nguyễn Huệ, Quận 1, TP.HCM",
    notes: "",
    trackingNumber: "",
  },
  {
    id: "ORD-003",
    orderDate: new Date("2023-06-03"),
    customerName: "Lê Văn C",
    customerEmail: "levanc@example.com",
    customerAvatar: "",
    orderStatus: "Shipped",
    paymentStatus: "Paid",
    paymentMethod: "Momo",
    totalAmount: 1850000,
    items: 2,
    shippingAddress: "789 Đường Lý Tự Trọng, Quận 1, TP.HCM",
    notes: "Để hàng tại bảo vệ",
    trackingNumber: "VN123456789",
  },
  {
    id: "ORD-004",
    orderDate: new Date("2023-06-04"),
    customerName: "Phạm Thị D",
    customerEmail: "phamthid@example.com",
    customerAvatar: "",
    orderStatus: "Delivered",
    paymentStatus: "Paid",
    paymentMethod: "Banking",
    totalAmount: 3250000,
    items: 7,
    shippingAddress: "101 Đường Hai Bà Trưng, Quận 1, TP.HCM",
    notes: "",
    trackingNumber: "VN987654321",
  },
  {
    id: "ORD-005",
    orderDate: new Date("2023-06-05"),
    customerName: "Hoàng Văn E",
    customerEmail: "hoangvane@example.com",
    customerAvatar: "",
    orderStatus: "Cancelled",
    paymentStatus: "Refunded",
    paymentMethod: "Banking",
    totalAmount: 1950000,
    items: 4,
    shippingAddress: "202 Đường Điện Biên Phủ, Quận 3, TP.HCM",
    notes: "Khách hàng đổi ý",
    trackingNumber: "",
  },
  {
    id: "ORD-006",
    orderDate: new Date("2023-06-06"),
    customerName: "Vũ Thị F",
    customerEmail: "vuthif@example.com",
    customerAvatar: "",
    orderStatus: "Pending",
    paymentStatus: "Pending",
    paymentMethod: "COD",
    totalAmount: 850000,
    items: 1,
    shippingAddress: "303 Đường Cách Mạng Tháng 8, Quận 3, TP.HCM",
    notes: "",
    trackingNumber: "",
  },
  {
    id: "ORD-007",
    orderDate: new Date("2023-06-07"),
    customerName: "Đặng Văn G",
    customerEmail: "dangvang@example.com",
    customerAvatar: "",
    orderStatus: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "ZaloPay",
    totalAmount: 1650000,
    items: 3,
    shippingAddress: "404 Đường Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
    notes: "Giao hàng giờ hành chính",
    trackingNumber: "",
  },
  {
    id: "ORD-008",
    orderDate: new Date("2023-06-08"),
    customerName: "Bùi Thị H",
    customerEmail: "buithih@example.com",
    customerAvatar: "",
    orderStatus: "Shipped",
    paymentStatus: "Paid",
    paymentMethod: "VNPay",
    totalAmount: 2750000,
    items: 6,
    shippingAddress: "505 Đường Võ Văn Tần, Quận 3, TP.HCM",
    notes: "",
    trackingNumber: "VN456789123",
  },
]

interface OrderListProps {
  status?: string
  onSelectionChange?: (selectedIds: string[]) => void
}

export default function OrderList({ status, onSelectionChange }: OrderListProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "orderDate", desc: true }])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<(typeof orders)[0] | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")

  // Filter orders by status if provided
  const filteredOrders = status ? orders.filter((order) => order.orderStatus === status) : orders

  // Define columns for the table
  const columns: ColumnDef<(typeof orders)[0]>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "Mã đơn hàng",
      cell: ({ row }) => (
        <div className="font-medium">
          <Link href={`/admin/don-hang/${row.original.id}`} className="text-blue-600 hover:underline">
            {row.original.id}
          </Link>
          {row.original.notes && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                    Ghi chú
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{row.original.notes}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ),
    },
    {
      accessorKey: "orderDate",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Ngày đặt
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="whitespace-nowrap">{format(row.original.orderDate, "dd/MM/yyyy HH:mm", { locale: vi })}</div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Khách hàng",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.customerAvatar} alt={row.original.customerName} />
            <AvatarFallback>{row.original.customerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.customerName}</div>
            <div className="text-xs text-muted-foreground">{row.original.customerEmail}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "items",
      header: "SL",
      cell: ({ row }) => <div className="text-center">{row.original.items}</div>,
    },
    {
      accessorKey: "orderStatus",
      header: "Trạng thái đơn hàng",
      cell: ({ row }) => <OrderStatusBadge status={row.original.orderStatus} />,
    },
    {
      accessorKey: "paymentStatus",
      header: "Thanh toán",
      cell: ({ row }) => (
        <div>
          <PaymentStatusBadge status={row.original.paymentStatus} />
          <div className="text-xs text-muted-foreground mt-1">{row.original.paymentMethod}</div>
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="justify-end w-full"
        >
          Tổng tiền
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.original.totalAmount.toString())
        const formatted = new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original

        return (
          <div className="flex justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setSelectedOrder(order)
                      setQuickViewOpen(true)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Xem nhanh</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 ml-1">
                  <span className="sr-only">Mở menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/don-hang/${order.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Cập nhật trạng thái
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="mr-2 h-4 w-4" />
                  In đơn hàng
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Gửi email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hủy đơn hàng
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  // Create table instance
  const table = useReactTable({
    data: filteredOrders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Update parent component with selected order IDs
  useEffect(() => {
    if (onSelectionChange) {
      const selectedIds = Object.keys(rowSelection).map((idx) => filteredOrders[Number.parseInt(idx)].id)
      onSelectionChange(selectedIds)
    }
  }, [rowSelection, filteredOrders, onSelectionChange])

  // Mobile card view for orders
  const MobileOrderCard = ({ order }: { order: (typeof orders)[0] }) => {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={rowSelection[filteredOrders.findIndex((o) => o.id === order.id)] || false}
                  onCheckedChange={(value) => {
                    const idx = filteredOrders.findIndex((o) => o.id === order.id)
                    table.toggleRowSelected(idx, !!value)
                  }}
                  aria-label="Select order"
                />
                <Link href={`/admin/don-hang/${order.id}`} className="font-medium text-blue-600 hover:underline">
                  {order.id}
                </Link>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {format(order.orderDate, "dd/MM/yyyy HH:mm", { locale: vi })}
              </div>
            </div>
            <div className="flex">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedOrder(order)
                        setQuickViewOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Xem nhanh</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Mở menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/don-hang/${order.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Cập nhật trạng thái
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="mr-2 h-4 w-4" />
                    In đơn hàng
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    Gửi email
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hủy đơn hàng
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={order.customerAvatar} alt={order.customerName} />
              <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{order.customerName}</div>
              <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="text-xs text-muted-foreground">Trạng thái</div>
              <OrderStatusBadge status={order.orderStatus} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Thanh toán</div>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-muted-foreground">Số lượng SP</div>
              <div className="font-medium">{order.items}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Tổng tiền</div>
              <div className="font-medium">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(order.totalAmount)}
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-3 text-xs bg-amber-50 p-2 rounded border border-amber-200">
              <span className="font-medium">Ghi chú:</span> {order.notes}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Tìm kiếm đơn hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {Object.keys(rowSelection).length > 0 && (
          <OrderBulkActions
            selectedCount={Object.keys(rowSelection).length}
            onClearSelection={() => setRowSelection({})}
          />
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Cột <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id === "orderDate"
                      ? "Ngày đặt"
                      : column.id === "customerName"
                        ? "Khách hàng"
                        : column.id === "items"
                          ? "Số lượng SP"
                          : column.id === "orderStatus"
                            ? "Trạng thái đơn hàng"
                            : column.id === "paymentStatus"
                              ? "Thanh toán"
                              : column.id === "totalAmount"
                                ? "Tổng tiền"
                                : column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isMobile ? (
        <div>
          {filteredOrders.map((order) => (
            <MobileOrderCard key={order.id} order={order} />
          ))}

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trước
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Sau
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Không tìm thấy đơn hàng nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-end space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {Object.keys(rowSelection).length > 0
            ? `Đã chọn ${Object.keys(rowSelection).length} trong tổng số ${filteredOrders.length} đơn hàng.`
            : `Hiển thị ${table.getRowModel().rows.length} trong tổng số ${filteredOrders.length} đơn hàng.`}
        </div>
        {!isMobile && (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trước
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Sau
            </Button>
          </div>
        )}
      </div>

      {selectedOrder && <OrderQuickView order={selectedOrder} open={quickViewOpen} onOpenChange={setQuickViewOpen} />}
    </div>
  )
}

