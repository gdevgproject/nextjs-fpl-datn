"use client";

import { useState, memo, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteAddress, useSetDefaultAddress } from "../queries";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import type { Address } from "../types";
import { AddressCard } from "./address-card";
import { Loader2 } from "lucide-react";

interface AddressListProps {
  addresses: Address[];
  onEdit: (id: number) => void;
  isEditing: boolean;
  isAdding: boolean;
}

export const AddressList = memo(function AddressList({
  addresses,
  onEdit,
  isEditing,
  isAdding,
}: AddressListProps) {
  const { toast } = useSonnerToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);

  // Set up mutation hooks for address operations
  const deleteAddressMutation = useDeleteAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();

  // Handle setting an address as default
  const handleSetDefault = useCallback(
    (id: number) => {
      setDefaultAddressMutation.mutate(id, {
        onSuccess: () => {
          toast("Đã đặt làm địa chỉ mặc định", {
            description: "Địa chỉ đã được đặt làm mặc định thành công",
          });
        },
        onError: (error) => {
          toast("Đặt địa chỉ mặc định thất bại", {
            description:
              error instanceof Error
                ? error.message
                : "Đã xảy ra lỗi khi đặt địa chỉ mặc định",
          });
        },
      });
    },
    [setDefaultAddressMutation, toast]
  );

  // Handle deleting address with confirmation
  const handleDeleteAddress = useCallback(() => {
    if (!addressToDelete) return;

    deleteAddressMutation.mutate(addressToDelete, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setAddressToDelete(null);
        toast("Đã xóa địa chỉ", {
          description: "Địa chỉ đã được xóa thành công",
        });
      },
      onError: (error) => {
        setIsDialogOpen(false);
        toast("Xóa địa chỉ thất bại", {
          description:
            error instanceof Error
              ? error.message
              : "Đã xảy ra lỗi khi xóa địa chỉ",
        });
      },
    });
  }, [addressToDelete, deleteAddressMutation, toast]);

  // Handle showing delete confirmation dialog
  const openDeleteDialog = useCallback((id: number) => {
    setAddressToDelete(id);
    setIsDialogOpen(true);
  }, []);

  // Don't show anything if editing or adding a new address
  if (isEditing || isAdding) {
    return null;
  }

  // Show empty state if no addresses
  if (addresses.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/30">
        <p className="text-muted-foreground">
          Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới để tiếp tục.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            onEdit={onEdit}
            onDelete={openDeleteDialog}
            onSetDefault={handleSetDefault}
            isDeletingId={
              deleteAddressMutation.isPending ? addressToDelete! : undefined
            }
            isSettingDefaultId={
              setDefaultAddressMutation.isPending
                ? setDefaultAddressMutation.variables
                : undefined
            }
          />
        ))}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa địa chỉ</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAddressMutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAddress();
              }}
              disabled={deleteAddressMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAddressMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa địa chỉ"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});
