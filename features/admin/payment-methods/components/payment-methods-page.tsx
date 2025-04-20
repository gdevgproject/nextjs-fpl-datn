"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import { PaymentMethodDialog } from "./payment-method-dialog";
import { PaymentMethodsTable } from "./payment-methods-table";
import { PaymentMethodsSearch } from "./payment-methods-search";
import { usePaymentMethods } from "../hooks";
import type {
  PaymentMethod,
  PaymentMethodsFilters,
  PaymentMethodsPagination,
  PaymentMethodsSort,
} from "../types";

export function PaymentMethodsPage() {
  // State for search, pagination, and dialog
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sort, setSort] = useState<PaymentMethodsSort>({
    column: "name",
    direction: "asc",
  });
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    PaymentMethod | undefined
  >(undefined);

  // Create filter and pagination objects
  const filters: PaymentMethodsFilters = {
    search: search.trim() !== "" ? search : undefined,
  };

  const pagination: PaymentMethodsPagination = {
    page,
    pageSize,
  };

  // Fetch payment methods with TanStack Query
  const { data, isLoading, isError } = usePaymentMethods(
    filters,
    pagination,
    sort
  );

  // Calculate total pages
  const totalPages = data?.count ? Math.ceil(data.count / pageSize) : 0;

  // Handlers for pagination
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Handler for search
  const handleSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
    setPage(1); // Reset to first page on new search
  }, []);

  // Handlers for payment method dialog
  const handleAddClick = useCallback(() => {
    setDialogMode("create");
    setSelectedPaymentMethod(undefined);
    setDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((paymentMethod: PaymentMethod) => {
    setDialogMode("edit");
    setSelectedPaymentMethod(paymentMethod);
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedPaymentMethod(undefined);
    }
  }, []);

  // Error state
  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Phương thức thanh toán</CardTitle>
          <CardDescription>
            Quản lý các phương thức thanh toán trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-destructive">
            <p>Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Làm mới trang
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Phương thức thanh toán</CardTitle>
          <CardDescription>
            Quản lý các phương thức thanh toán trong hệ thống. Phương thức thanh
            toán chỉ có thể được kích hoạt hoặc vô hiệu hóa, không thể xóa để
            đảm bảo toàn vẹn dữ liệu.
          </CardDescription>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Thêm mới
        </Button>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-6">
          <PaymentMethodsSearch onSearch={handleSearch} />
        </div>

        {/* Table */}
        <PaymentMethodsTable
          data={data?.data || []}
          isLoading={isLoading}
          onEdit={handleEditClick}
        />

        {/* Pagination */}
        {!isLoading && totalPages > 0 && (
          <div className="mt-6 flex items-center justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showSummary
              summary={`Hiển thị ${(page - 1) * pageSize + 1} - ${Math.min(
                page * pageSize,
                data?.count || 0
              )} trong tổng số ${data?.count || 0}`}
            />
          </div>
        )}

        {/* Dialog for add/edit */}
        <PaymentMethodDialog
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          mode={dialogMode}
          paymentMethod={selectedPaymentMethod}
        />
      </CardContent>
    </Card>
  );
}
