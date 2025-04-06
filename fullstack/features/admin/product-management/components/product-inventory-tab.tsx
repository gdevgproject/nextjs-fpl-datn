"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Plus, Minus, History } from "lucide-react";
import { ProductWithRelations } from "../types";
import { useAdjustInventory, useGetInventoryHistory } from "../queries";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductInventoryTabProps {
  product: ProductWithRelations;
}

export function ProductInventoryTab({ product }: ProductInventoryTabProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">("add");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const adjustInventory = useAdjustInventory();
  const { data: inventoryHistory, isLoading: isLoadingHistory } =
    useGetInventoryHistory(selectedVariantId || 0, {
      enabled: isHistoryDialogOpen && selectedVariantId !== null,
    });

  // Handle inventory adjustment
  const handleAdjustInventory = async () => {
    if (!selectedVariantId) return;

    try {
      const finalAmount =
        adjustmentType === "add"
          ? Math.abs(adjustmentAmount)
          : -Math.abs(adjustmentAmount);

      await adjustInventory.mutateAsync({
        variant_id: selectedVariantId,
        change_amount: finalAmount,
        reason: adjustmentReason,
      });

      toast.success("Đã cập nhật tồn kho thành công");
      setIsDialogOpen(false);

      // Reset form
      setAdjustmentAmount(0);
      setAdjustmentReason("");
      setAdjustmentType("add");
    } catch (error) {
      console.error("Error adjusting inventory:", error);
      toast.error("Cập nhật tồn kho thất bại");
    }
  };

  // Open adjustment dialog with a variant
  const openAdjustmentDialog = (variantId: number) => {
    setSelectedVariantId(variantId);
    setAdjustmentAmount(0);
    setAdjustmentReason("");
    setAdjustmentType("add");
    setIsDialogOpen(true);
  };

  // Open history dialog for a variant
  const openHistoryDialog = (variantId: number) => {
    setSelectedVariantId(variantId);
    setIsHistoryDialogOpen(true);
  };

  // Get variant details for the selected variant
  const getSelectedVariant = () => {
    return product.variants.find((v) => v.id === selectedVariantId);
  };

  // Format timestamp to local date and time
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý tồn kho & giá</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dung tích (ML)</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Giá gốc</TableHead>
                <TableHead>Giá khuyến mãi</TableHead>
                <TableHead className="text-center">Tồn kho</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">
                    {variant.volume_ml} ml
                  </TableCell>
                  <TableCell>{variant.sku}</TableCell>
                  <TableCell>{formatCurrency(variant.price)}</TableCell>
                  <TableCell>
                    {variant.sale_price ? (
                      formatCurrency(variant.sale_price)
                    ) : (
                      <span className="text-muted-foreground">Không có</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        variant.stock_quantity > 0 ? "outline" : "destructive"
                      }
                      className="justify-center min-w-16"
                    >
                      {variant.stock_quantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAdjustmentDialog(variant.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Điều chỉnh
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openHistoryDialog(variant.id)}
                      >
                        <History className="h-4 w-4 mr-1" />
                        Lịch sử
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
            <DialogDescription>
              Điều chỉnh số lượng tồn kho cho sản phẩm {product.name} (
              {getSelectedVariant()?.volume_ml} ml)
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adjustment-type">Loại điều chỉnh</Label>
              <Select
                value={adjustmentType}
                onValueChange={(value) =>
                  setAdjustmentType(value as "add" | "remove")
                }
              >
                <SelectTrigger id="adjustment-type">
                  <SelectValue placeholder="Chọn loại điều chỉnh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Thêm vào kho</SelectItem>
                  <SelectItem value="remove">Lấy ra khỏi kho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustment-amount">Số lượng</Label>
              <Input
                id="adjustment-amount"
                type="number"
                min="1"
                value={adjustmentAmount}
                onChange={(e) =>
                  setAdjustmentAmount(parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustment-reason">Lý do</Label>
              <Textarea
                id="adjustment-reason"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Nhập lý do điều chỉnh tồn kho"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleAdjustInventory}
              disabled={
                adjustmentAmount <= 0 ||
                !adjustmentReason.trim() ||
                adjustInventory.isPending
              }
            >
              {adjustInventory.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Cập nhật tồn kho"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lịch sử tồn kho</DialogTitle>
            <DialogDescription>
              Lịch sử thay đổi tồn kho cho sản phẩm {product.name} (
              {getSelectedVariant()?.volume_ml} ml)
            </DialogDescription>
          </DialogHeader>

          {isLoadingHistory ? (
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center space-x-4 py-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4">
              {!inventoryHistory?.data || inventoryHistory.data.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Chưa có lịch sử điều chỉnh tồn kho
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Thay đổi</TableHead>
                      <TableHead>Sau thay đổi</TableHead>
                      <TableHead>Lý do</TableHead>
                      <TableHead>Người thực hiện</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryHistory.data.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {formatTimestamp(record.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.change_amount > 0
                                ? "success"
                                : "destructive"
                            }
                          >
                            {record.change_amount > 0 ? "+" : ""}
                            {record.change_amount}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.stock_after_change}</TableCell>
                        <TableCell>{record.reason}</TableCell>
                        <TableCell>{record.updated_by_name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsHistoryDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
