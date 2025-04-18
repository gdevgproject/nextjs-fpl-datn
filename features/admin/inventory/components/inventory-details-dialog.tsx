"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface InventoryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: any | null;
}

export function InventoryDetailsDialog({
  open,
  onOpenChange,
  inventory,
}: InventoryDetailsDialogProps) {
  const [updatedByUser, setUpdatedByUser] = useState<any | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!open || !inventory) {
      setUpdatedByUser(null);
      setOrderDetails(null);
      return;
    }

    // Fetch user who updated the inventory (if any)
    if (inventory.updated_by) {
      supabase
        .from("profiles")
        .select("id, display_name")
        .eq("id", inventory.updated_by)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setUpdatedByUser(data);
          }
        });
    }

    // Fetch order details (if any)
    if (inventory.order_id) {
      supabase
        .from("orders")
        .select(
          `
          id, 
          order_date, 
          recipient_name, 
          recipient_phone,
          order_statuses(id, name)
        `
        )
        .eq("id", inventory.order_id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setOrderDetails(data);
          }
        });
    }
  }, [open, inventory, supabase]);

  if (!inventory) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chi tiết thay đổi kho</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về lần thay đổi kho này
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Thời gian
              </h4>
              <p className="text-sm">
                {format(new Date(inventory.timestamp), "dd/MM/yyyy HH:mm:ss", {
                  locale: vi,
                })}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Số lượng thay đổi
              </h4>
              <Badge
                variant={
                  inventory.change_amount > 0
                    ? "success"
                    : inventory.change_amount < 0
                    ? "destructive"
                    : "outline"
                }
                className="mt-1"
              >
                {inventory.change_amount > 0 ? "+" : ""}
                {inventory.change_amount}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Sản phẩm
            </h4>
            <p className="text-sm font-medium">
              {inventory.product_variants?.products?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {inventory.product_variants?.volume_ml}ml - SKU:{" "}
              {inventory.product_variants?.sku}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Lý do</h4>
            <p className="text-sm">{inventory.reason}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Tồn kho sau thay đổi
              </h4>
              <p className="text-sm">{inventory.stock_after_change}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Người thực hiện
              </h4>
              <p className="text-sm">
                {updatedByUser
                  ? updatedByUser.display_name
                  : inventory.updated_by
                  ? "Đang tải..."
                  : "Hệ thống"}
              </p>
            </div>
          </div>

          {inventory.order_id && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Thông tin đơn hàng
              </h4>
              {orderDetails ? (
                <div className="text-sm space-y-1">
                  <p>Mã đơn: #{orderDetails.id}</p>
                  <p>
                    Ngày đặt:{" "}
                    {format(new Date(orderDetails.order_date), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </p>
                  <p>Người nhận: {orderDetails.recipient_name}</p>
                  <p>SĐT: {orderDetails.recipient_phone}</p>
                  <p>Trạng thái: {orderDetails.order_statuses?.name}</p>
                </div>
              ) : (
                <p className="text-sm">Đang tải thông tin đơn hàng...</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
