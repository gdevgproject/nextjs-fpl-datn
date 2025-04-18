"use client";

import { useState, useCallback } from "react";
import { useUserAddresses } from "../queries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { AddressForm } from "./address-form";
import { AddressList } from "./address-list";
import { useAuthQuery } from "@/features/auth/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export function AddressPage() {
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;
  const userId = session?.user?.id ?? "";
  const { data: addresses, isLoading } = useUserAddresses(userId);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);

  // Handle adding a new address
  const handleAddNew = useCallback(() => {
    setIsAddingNew(true);
    setEditingAddressId(null);
  }, []);

  // Handle canceling add/edit
  const handleCancel = useCallback(() => {
    setIsAddingNew(false);
    setEditingAddressId(null);
  }, []);

  // Handle editing an address
  const handleEdit = useCallback((addressId: number) => {
    setEditingAddressId(addressId);
    setIsAddingNew(false);
  }, []);

  // Handle successful add/edit
  const handleSuccess = useCallback(() => {
    setIsAddingNew(false);
    setEditingAddressId(null);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Địa chỉ giao hàng</h1>
          <p className="text-muted-foreground">
            Vui lòng đăng nhập để quản lý địa chỉ giao hàng
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Địa chỉ giao hàng</h1>
          <p className="text-muted-foreground">
            Quản lý địa chỉ giao hàng của bạn
          </p>
        </div>
        {!isAddingNew && !editingAddressId && (
          <Button onClick={handleAddNew} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            <span>Thêm địa chỉ mới</span>
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isAddingNew && (
          <motion.div
            key="add-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Thêm địa chỉ mới</CardTitle>
                <CardDescription>
                  Nhập thông tin địa chỉ giao hàng mới của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddressForm
                  onCancel={handleCancel}
                  onSuccess={handleSuccess}
                  isFirstAddress={(addresses?.length ?? 0) === 0}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {editingAddressId && addresses && (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Chỉnh sửa địa chỉ</CardTitle>
                <CardDescription>
                  Cập nhật thông tin địa chỉ giao hàng của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddressForm
                  address={addresses.find(
                    (addr) => addr.id === editingAddressId
                  )}
                  onCancel={handleCancel}
                  onSuccess={handleSuccess}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </motion.div>
        ) : (
          <motion.div
            key="address-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AddressList
              addresses={addresses || []}
              onEdit={handleEdit}
              isEditing={!!editingAddressId}
              isAdding={isAddingNew}
              userId={userId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
