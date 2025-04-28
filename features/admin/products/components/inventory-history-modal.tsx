"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  PackageOpen,
  UserCircle,
  CalendarClock,
  ShoppingBag,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useInventoryHistory,
  formatInventoryTimestamp,
  getInventoryReasonDisplay,
  getInventoryChangeColor,
} from "../hooks/use-inventory-history";
import { format } from "date-fns";

interface InventoryHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: {
    id: number;
    volume_ml: number;
    price: number;
    stock_quantity: number;
    product_name?: string;
  } | null;
}

export function InventoryHistoryModal({
  open,
  onOpenChange,
  variant,
}: InventoryHistoryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch inventory history for the selected variant
  const {
    data: historyData,
    isLoading,
    isError,
  } = useInventoryHistory(variant?.id || null);

  // Filter history by search term if provided
  const filteredHistory = searchTerm
    ? historyData?.filter(
        (item) =>
          item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.user_email &&
            item.user_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.order_number && item.order_number.includes(searchTerm))
      )
    : historyData;

  if (!variant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageOpen className="h-5 w-5" />
            Lịch sử kho {variant.volume_ml}ml
            {variant.product_name && ` - ${variant.product_name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="border rounded-md bg-muted/30 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground">Biến thể</p>
              <p className="font-medium">{variant.volume_ml}ml</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tồn kho hiện tại</p>
              <p className="font-medium">{variant.stock_quantity}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Giá</p>
              <p className="font-medium">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(variant.price)}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm..."
              className="pl-8 w-full sm:w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 text-center text-red-600">
            Đã có lỗi xảy ra khi tải dữ liệu lịch sử kho.
          </div>
        ) : filteredHistory?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
            <PackageOpen className="h-10 w-10 mb-2 opacity-20" />
            <p>Không có lịch sử thay đổi kho cho biến thể này</p>
            {searchTerm && (
              <p className="text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Thay đổi</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Sau thay đổi</TableHead>
                <TableHead>Thực hiện bởi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatInventoryTimestamp(item.timestamp)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${getInventoryChangeColor(
                        item.change_amount
                      )} flex items-center gap-1.5 whitespace-nowrap`}
                    >
                      {item.change_amount > 0 ? (
                        <ArrowUpCircle className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownCircle className="h-3.5 w-3.5" />
                      )}
                      {item.change_amount > 0
                        ? `+${item.change_amount}`
                        : item.change_amount}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.order_id && (
                        <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {getInventoryReasonDisplay(
                        item.reason,
                        item.order_number
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.stock_after_change}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.updated_by ? (
                      <div className="flex items-center gap-1.5">
                        <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        {item.user_email || "Người dùng " + item.updated_by}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Hệ thống</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
