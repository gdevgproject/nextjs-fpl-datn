"use client"

import { useState } from "react"
import Link from "next/link"
import { Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { DiscountStatusBadge } from "./discount-status-badge"
import { DiscountDeleteDialog } from "./discount-delete-dialog"

interface DiscountListProps {
  status: "all" | "active" | "inactive" | "expired"
}

// Mock data
const discounts = [
  {
    id: "1",
    code: "SUMMER2023",
    description: "Giảm giá mùa hè 2023",
    discount_percentage: 15,
    max_discount_amount: 200000,
    min_order_value: 500000,
    max_uses: 100,
    remaining_uses: 45,
    start_date: "2023-06-01",
    end_date: "2023-08-31",
    is_active: true,
    status: "active",
  },
  {
    id: "2",
    code: "WELCOME10",
    description: "Giảm giá chào mừng khách hàng mới",
    discount_percentage: 10,
    max_discount_amount: 100000,
    min_order_value: 300000,
    max_uses: 500,
    remaining_uses: 320,
    start_date: "2023-01-01",
    end_date: "2023-12-31",
    is_active: true,
    status: "active",
  },
  {
    id: "3",
    code: "SPRING2023",
    description: "Giảm giá mùa xuân 2023",
    discount_percentage: 20,
    max_discount_amount: 300000,
    min_order_value: 1000000,
    max_uses: 50,
    remaining_uses: 0,
    start_date: "2023-03-01",
    end_date: "2023-05-31",
    is_active: false,
    status: "expired",
  },
  {
    id: "4",
    code: "BEAUTY25",
    description: "Giảm giá cho sản phẩm làm đẹp",
    discount_percentage: 25,
    max_discount_amount: 500000,
    min_order_value: 2000000,
    max_uses: 30,
    remaining_uses: 30,
    start_date: "2023-09-01",
    end_date: "2023-12-31",
    is_active: false,
    status: "inactive",
  },
]

export function DiscountList({ status }: DiscountListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null)

  const filteredDiscounts = status === "all" ? discounts : discounts.filter((discount) => discount.status === status)

  const handleDelete = (id: string) => {
    setSelectedDiscountId(id)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã giảm giá</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Giảm giá</TableHead>
            <TableHead>Đơn tối thiểu</TableHead>
            <TableHead>Thời gian hiệu lực</TableHead>
            <TableHead>Lượt sử dụng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDiscounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Không có mã giảm giá nào
              </TableCell>
            </TableRow>
          ) : (
            filteredDiscounts.map((discount) => (
              <TableRow key={discount.id}>
                <TableCell className="font-medium">{discount.code}</TableCell>
                <TableCell>{discount.description}</TableCell>
                <TableCell>
                  {discount.discount_percentage}%
                  {discount.max_discount_amount > 0 && (
                    <span className="text-xs text-muted-foreground block">
                      Tối đa {new Intl.NumberFormat("vi-VN").format(discount.max_discount_amount)}đ
                    </span>
                  )}
                </TableCell>
                <TableCell>{new Intl.NumberFormat("vi-VN").format(discount.min_order_value)}đ</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{new Date(discount.start_date).toLocaleDateString("vi-VN")}</div>
                    <div>đến {new Date(discount.end_date).toLocaleDateString("vi-VN")}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>
                      {discount.remaining_uses}/{discount.max_uses}
                    </div>
                    <div className="text-xs text-muted-foreground">Còn lại: {discount.remaining_uses}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <DiscountStatusBadge status={discount.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/admin/ma-giam-gia/${discount.id}`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Chỉnh sửa</span>
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(discount.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Xóa</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end p-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <DiscountDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        discountId={selectedDiscountId}
      />
    </div>
  )
}

