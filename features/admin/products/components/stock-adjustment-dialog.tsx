"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StockAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
  changeAmount: number;
  currentStock: number;
  newStock: number;
}

export function StockAdjustmentDialog({
  open,
  onClose,
  onConfirm,
  isPending,
  changeAmount,
  currentStock,
  newStock,
}: StockAdjustmentDialogProps) {
  const [reason, setReason] = useState<string>("");

  // Common reasons for stock adjustments
  const commonReasons = [
    { value: "manual-count", label: "Kiểm kê thực tế" },
    { value: "lost-damaged", label: "Sản phẩm bị mất/hư hỏng" },
    { value: "vendor-return", label: "Trả hàng cho nhà cung cấp" },
    { value: "inventory-correction", label: "Điều chỉnh sai sót" },
    { value: "new-shipment", label: "Nhập hàng mới" },
    { value: "product-testing", label: "Sử dụng cho kiểm tra sản phẩm" },
    { value: "customer-return", label: "Khách hàng trả lại" },
  ];

  const handleReasonSelect = (value: string) => {
    switch (value) {
      case "manual-count":
        setReason("Điều chỉnh sau kiểm kê thực tế");
        break;
      case "lost-damaged":
        setReason("Sản phẩm bị mất/hư hỏng");
        break;
      case "vendor-return":
        setReason("Trả hàng cho nhà cung cấp");
        break;
      case "inventory-correction":
        setReason("Điều chỉnh sai sót trong kho");
        break;
      case "new-shipment":
        setReason("Nhập hàng mới từ nhà cung cấp");
        break;
      case "product-testing":
        setReason("Sử dụng cho kiểm tra sản phẩm");
        break;
      case "customer-return":
        setReason("Khách hàng trả lại hàng");
        break;
      case "custom":
        // Keep the current reason when selecting custom
        break;
      default:
        setReason("");
    }
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      return;
    }
    onConfirm(reason);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
          <DialogDescription>
            Vui lòng cung cấp lý do điều chỉnh số lượng tồn kho.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex flex-col">
              <span className="text-muted-foreground">Tồn kho hiện tại:</span>
              <span className="font-medium">{currentStock}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground">Tồn kho mới:</span>
              <span className="font-medium">{newStock}</span>
            </div>
            <div className="flex flex-col col-span-2">
              <span className="text-muted-foreground">Thay đổi:</span>
              <span
                className={`font-medium ${
                  changeAmount > 0
                    ? "text-green-600"
                    : changeAmount < 0
                    ? "text-red-600"
                    : ""
                }`}
              >
                {changeAmount > 0 ? "+" : ""}
                {changeAmount} ({changeAmount > 0 ? "Tăng" : "Giảm"}{" "}
                {Math.abs(changeAmount)})
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="reason-select"
              className="text-sm font-medium leading-none"
            >
              Lý do phổ biến
            </label>
            <Select onValueChange={handleReasonSelect}>
              <SelectTrigger id="reason-select">
                <SelectValue placeholder="Chọn lý do điều chỉnh" />
              </SelectTrigger>
              <SelectContent>
                {commonReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Lý do khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="reason-text"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Lý do điều chỉnh <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="reason-text"
              placeholder="Nhập chi tiết lý do điều chỉnh tồn kho..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={3}
              required
            />
            {!reason.trim() && (
              <p className="text-xs text-red-500">
                Vui lòng điền lý do điều chỉnh
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || !reason.trim()}
          >
            {isPending ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
