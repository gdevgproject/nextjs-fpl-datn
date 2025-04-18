"use client";

import { useState } from "react";
import { AdminLayout } from "@/features/admin/shared/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { usePaymentMethods } from "@/features/admin/payment-methods/hooks/use-payment-methods";
import { useDeletePaymentMethod } from "@/features/admin/payment-methods/hooks/use-delete-payment-method";
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast";
import { useDebounce } from "@/features/admin/payment-methods/hooks/use-debounce";
import { PaymentMethodDialog } from "@/features/admin/payment-methods/components/payment-method-dialog";

export default function PaymentMethodsPage() {
  const toast = useSonnerToast();

  // State for search, pagination, and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // State for payment method dialog and delete confirmation
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch payment methods with pagination, search, and sorting
  const {
    data: paymentMethodsData,
    isLoading,
    error,
    refetch,
  } = usePaymentMethods(
    { search: debouncedSearch },
    { page: currentPage, pageSize },
    { column: sortColumn, direction: sortDirection }
  );

  // Delete payment method mutation
  const deletePaymentMethodMutation = useDeletePaymentMethod();

  // Handle sort toggle
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Handle payment method edit
  const handleEdit = (paymentMethod: any) => {
    setSelectedPaymentMethod(paymentMethod);
    setIsEditDialogOpen(true);
  };

  // Handle payment method delete
  const handleDelete = (paymentMethod: any) => {
    setSelectedPaymentMethod(paymentMethod);
    setIsDeleteDialogOpen(true);
  };

  // Confirm payment method deletion
  const confirmDelete = async () => {
    if (!selectedPaymentMethod) return;

    try {
      setIsDeleting(true);
      await deletePaymentMethodMutation.mutateAsync({
        id: selectedPaymentMethod.id,
      });

      // Close dialog before showing toast
      setIsDeleteDialogOpen(false);

      // Refetch data after successful deletion
      await refetch();

      toast.success("Phương thức thanh toán đã được xóa thành công");
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast.error(
        `Lỗi khi xóa phương thức thanh toán: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate total pages
  const totalItems = paymentMethodsData?.count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentPage(1);
          }}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i <= 1 || i >= totalPages) continue;

      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(i);
            }}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentPage(totalPages);
            }}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý phương thức thanh toán
          </h1>
          <p className="text-muted-foreground">
            Quản lý danh sách các phương thức thanh toán trong hệ thống
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm phương thức thanh toán..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm phương thức thanh toán
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Tên phương thức
                      {sortColumn === "name" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("is_active")}
                  >
                    <div className="flex items-center">
                      Trạng thái
                      {sortColumn === "is_active" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-red-500">
                      Lỗi khi tải dữ liệu:{" "}
                      {error instanceof Error ? error.message : "Unknown error"}
                    </TableCell>
                  </TableRow>
                ) : paymentMethodsData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Không có phương thức thanh toán nào. Hãy thêm phương thức
                      thanh toán mới.
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentMethodsData?.data?.map((paymentMethod: any) => (
                    <TableRow key={paymentMethod.id}>
                      <TableCell>{paymentMethod.id}</TableCell>
                      <TableCell className="font-medium">
                        {paymentMethod.name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {paymentMethod.description || "—"}
                      </TableCell>
                      <TableCell>
                        {paymentMethod.is_active ? (
                          <span className="text-green-500">Hoạt động</span>
                        ) : (
                          <span className="text-red-500">Không hoạt động</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Mở menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(paymentMethod)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(paymentMethod)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {!isLoading && paymentMethodsData?.data?.length > 0 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  aria-disabled={currentPage === 1}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {generatePaginationItems()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  aria-disabled={currentPage === totalPages}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {/* Create Payment Method Dialog */}
      <PaymentMethodDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />

      {/* Edit Payment Method Dialog */}
      {selectedPaymentMethod && (
        <PaymentMethodDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mode="edit"
          paymentMethod={selectedPaymentMethod}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xóa phương thức thanh toán "
              {selectedPaymentMethod?.name}" và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
