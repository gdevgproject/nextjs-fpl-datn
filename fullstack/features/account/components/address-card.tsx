"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatPhoneNumber } from "@/lib/utils/format";
import type { Address } from "../types";
import { useSetDefaultAddress } from "../queries";

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  disabled?: boolean;
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  disabled = false,
}: AddressCardProps) {
  // Sử dụng hook để kiểm tra trạng thái loading
  const setDefaultAddressMutation = useSetDefaultAddress();
  const isSettingDefault =
    setDefaultAddressMutation.isPending &&
    setDefaultAddressMutation.variables === address.id;

  return (
    <Card className={address.is_default ? "border-primary" : ""}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{address.recipient_name}</h3>
              {address.is_default && (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  Mặc định
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatPhoneNumber(address.recipient_phone)}
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-1 text-sm">
          <p>{address.street_address}</p>
          <p>
            {address.ward}, {address.district}
          </p>
          <p>{address.province_city}</p>
          {address.postal_code && <p>Mã bưu điện: {address.postal_code}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            disabled={disabled}
          >
            <Edit className="mr-2 h-4 w-4" />
            Sửa
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={disabled}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa địa chỉ</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể
                  hoàn tác.
                  {address.is_default && (
                    <p className="mt-2 font-medium text-destructive">
                      Lưu ý: Đây là địa chỉ mặc định của bạn. Nếu xóa, hệ thống
                      sẽ tự động chọn địa chỉ khác làm mặc định.
                    </p>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Xóa</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {!address.is_default && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onSetDefault}
            disabled={disabled || isSettingDefault}
          >
            {isSettingDefault ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Đặt làm mặc định"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
