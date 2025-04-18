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
import { useConcentrations } from "../../../../../../features/admin/concentrations/hooks/use-concentrations";
import { useDeleteConcentration } from "../../../../../../features/admin/concentrations/hooks/use-delete-concentration";
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast";
import { useDebounce } from "../../../../../../features/admin/concentrations/hooks/use-debounce";
import { ConcentrationDialog } from "../../../../../../features/admin/concentrations/components/concentration-dialog";
import { formatDate } from "@/shared/lib/utils";

export default function ConcentrationsPage() {
  const toast = useSonnerToast();

  // State for search, pagination, and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // State for concentration dialog and delete confirmation
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedConcentration, setSelectedConcentration] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch concentrations with pagination, search, and sorting
  const {
    data: concentrationsData,
    isLoading,
    error,
    refetch,
  } = useConcentrations(
    { search: debouncedSearch },
    { page: currentPage, pageSize },
    { column: sortColumn, direction: sortDirection }
  );

  // Delete concentration mutation
  const deleteConcentrationMutation = useDeleteConcentration();

  // Handle sort toggle
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Handle concentration edit
  const handleEdit = (concentration: any) => {
    setSelectedConcentration(concentration);
    setIsEditDialogOpen(true);
  };

  // Handle concentration delete
  const handleDelete = (concentration: any) => {
    setSelectedConcentration(concentration);
    setIsDeleteDialogOpen(true);
  };

  // Confirm concentration deletion
  const confirmDelete = async () => {
    if (!selectedConcentration) return;

    try {
      setIsDeleting(true);
      await deleteConcentrationMutation.mutateAsync({
        id: selectedConcentration.id,
      });

      // Close dialog before showing toast
      setIsDeleteDialogOpen(false);

      // Refetch data after successful deletion
      await refetch();

      toast.success("Nồng độ đã được xóa thành công");
    } catch (error) {
      console.error("Error deleting concentration:", error);
      toast.error(
        `Lỗi khi xóa nồng độ: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate total pages
  const totalItems = concentrationsData?.count || 0;
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý nồng độ</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách các nồng độ nước hoa trong hệ thống
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm nồng độ..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm nồng độ
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
                      Tên nồng độ
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
                    onClick={() => handleSort("created_at")}
                  >
                    <div className="flex items-center">
                      Ngày tạo
                      {sortColumn === "created_at" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("updated_at")}
                  >
                    <div className="flex items-center">
                      Ngày cập nhật
                      {sortColumn === "updated_at" && (
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
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-16 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-red-500">
                      Lỗi khi tải dữ liệu:{" "}
                      {error instanceof Error ? error.message : "Unknown error"}
                    </TableCell>
                  </TableRow>
                ) : concentrationsData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Không có nồng độ nào. Hãy thêm nồng độ mới.
                    </TableCell>
                  </TableRow>
                ) : (
                  concentrationsData?.data?.map((concentration: any) => (
                    <TableRow key={concentration.id}>
                      <TableCell>{concentration.id}</TableCell>
                      <TableCell className="font-medium">
                        {concentration.name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {concentration.description || "—"}
                      </TableCell>
                      <TableCell>
                        {formatDate(concentration.created_at)}
                      </TableCell>
                      <TableCell>
                        {formatDate(concentration.updated_at)}
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
                              onClick={() => handleEdit(concentration)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(concentration)}
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
        {!isLoading && concentrationsData?.data?.length > 0 && (
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

      {/* Create Concentration Dialog */}
      <ConcentrationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />

      {/* Edit Concentration Dialog */}
      {selectedConcentration && (
        <ConcentrationDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mode="edit"
          concentration={selectedConcentration}
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
              Thao tác này sẽ xóa nồng độ "{selectedConcentration?.name}" và
              không thể hoàn tác.
              {selectedConcentration?.product_count > 0 && (
                <span className="text-destructive font-medium block mt-2">
                  Cảnh báo: Nồng độ này đang được sử dụng bởi{" "}
                  {selectedConcentration.product_count} sản phẩm. Việc xóa có
                  thể ảnh hưởng đến dữ liệu liên quan.
                </span>
              )}
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
