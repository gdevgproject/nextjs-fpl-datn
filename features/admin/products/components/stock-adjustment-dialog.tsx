"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  PackageOpen,
  ShieldAlert,
  Package,
  AlertCircle,
  ClipboardCheck,
  ClipboardList,
} from "lucide-react";

interface StockAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean;
  changeAmount: number;
  currentStock: number;
  newStock: number;
}

const COMMON_REASONS = [
  {
    label: "Điều chỉnh số lượng tồn kho",
    value: "Điều chỉnh số lượng tồn kho",
    icon: <ClipboardCheck className="h-4 w-4 mr-2" />,
  },
  {
    label: "Kiểm kê hàng tồn kho",
    value: "Kiểm kê hàng tồn kho",
    icon: <ClipboardList className="h-4 w-4 mr-2" />,
  },
  {
    label: "Thêm hàng từ nhà cung cấp",
    value: "Thêm hàng từ nhà cung cấp",
    icon: <Package className="h-4 w-4 mr-2" />,
  },
  {
    label: "Hàng bị hư hỏng",
    value: "Hàng bị hư hỏng",
    icon: <AlertCircle className="h-4 w-4 mr-2" />,
  },
  {
    label: "Hàng bị mất",
    value: "Hàng bị mất",
    icon: <ShieldAlert className="h-4 w-4 mr-2" />,
  },
];

export function StockAdjustmentDialog({
  open,
  onClose,
  onConfirm,
  isPending,
  changeAmount,
  currentStock,
  newStock,
}: StockAdjustmentDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  const handleSelectReason = (selectedReason: string) => {
    setReason(selectedReason);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageOpen className="h-5 w-5" />
            Điều chỉnh số lượng tồn kho
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 border rounded-md bg-muted/30 flex flex-col items-center w-32">
              <span className="text-xs text-muted-foreground mb-1">
                Hiện tại
              </span>
              <span className="font-bold text-xl">{currentStock}</span>
            </div>
            <div>
              <ArrowUpCircle
                className={`h-6 w-6 ${
                  changeAmount > 0 ? "text-green-500" : "text-transparent"
                }`}
              />
              <ArrowDownCircle
                className={`h-6 w-6 ${
                  changeAmount < 0 ? "text-red-500" : "text-transparent"
                }`}
              />
            </div>
            <div className="p-3 border rounded-md bg-muted/30 flex flex-col items-center w-32">
              <span className="text-xs text-muted-foreground mb-1">
                Sau thay đổi
              </span>
              <span className="font-bold text-xl">{newStock}</span>
            </div>
          </div>

          <div
            className={`mb-4 p-3 rounded-md ${
              changeAmount > 0
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            } text-sm`}
          >
            <div className="flex items-center">
              {changeAmount > 0 ? (
                <ArrowUpCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              ) : (
                <ArrowDownCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              )}
              <span>
                {changeAmount > 0
                  ? `Bạn đang thêm ${changeAmount} sản phẩm vào kho`
                  : `Bạn đang giảm ${Math.abs(changeAmount)} sản phẩm khỏi kho`}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="quick-reasons" className="text-sm font-medium">
                Lý do phổ biến
              </Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {COMMON_REASONS.map((reasonOption) => (
                  <Button
                    key={reasonOption.value}
                    type="button"
                    variant="outline"
                    className={`justify-start h-auto py-2 text-sm ${
                      reason === reasonOption.value
                        ? "border-primary/50 bg-primary/5"
                        : ""
                    }`}
                    onClick={() => handleSelectReason(reasonOption.value)}
                  >
                    {reasonOption.icon}
                    {reasonOption.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Lý do điều chỉnh <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do cho sự thay đổi tồn kho này"
                className="resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Thông tin này sẽ xuất hiện trong lịch sử kho.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim() || isPending}
            className={
              changeAmount > 0 ? "bg-green-600 hover:bg-green-700" : undefined
            }
          >
            {isPending ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Đang xử lý...
              </>
            ) : (
              "Xác nhận điều chỉnh"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
