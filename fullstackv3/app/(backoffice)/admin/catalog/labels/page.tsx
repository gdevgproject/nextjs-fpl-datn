"use client";

import { Badge } from "@/components/ui/badge";

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
import { useProductLabels } from "../../../../../features/admin/labels/hooks/use-product-labels";
import { useDeleteProductLabel } from "../../../../../features/admin/labels/hooks/use-delete-product-label";
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast";
import { useDebounce } from "../../../../../features/admin/labels/hooks/use-debounce";
import { ProductLabelDialog } from "../../../../../features/admin/labels/components/product-label-dialog";
import { formatDate } from "@/shared/lib/utils";

export default function ProductLabelsPage() {
  const toast = useSonnerToast();

  // State for search, pagination, and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // State for product label dialog and delete confirmation
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductLabel, setSelectedProductLabel] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch product labels with pagination, search, and sorting
  const {
    data: productLabelsData,
    isLoading,
    error,
    refetch,
  } = useProductLabels(
    { search: debouncedSearch },
    { page: currentPage, pageSize },
    { column: sortColumn, direction: sortDirection }
  );

  // Delete product label mutation
  const deleteProductLabelMutation = useDeleteProductLabel();

  // Handle sort toggle
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Handle product label edit
  const handleEdit = (productLabel: any) => {
    setSelectedProductLabel(productLabel);
    setIsEditDialogOpen(true);
  };

  // Handle product label delete
  const handleDelete = (productLabel: any) => {
    setSelectedProductLabel(productLabel);
    setIsDeleteDialogOpen(true);
  };

  // Confirm product label deletion
  const confirmDelete = async () => {
    if (!selectedProductLabel) return;

    try {
      setIsDeleting(true);
      await deleteProductLabelMutation.mutateAsync({
        id: selectedProductLabel.id,
      });

      // Close dialog before showing toast
      setIsDeleteDialogOpen(false);

      // Refetch data after successful deletion
      await refetch();

      toast.success("Nhãn sản phẩm đã được xóa thành công");
    } catch (error) {
      console.error("Error deleting product label:", error);
      toast.error(
        `Lỗi khi xóa nhãn sản phẩm: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate total pages
  const totalItems = productLabelsData?.count || 0;
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
            Quản lý nhãn sản phẩm
          </h1>
          <p className="text-muted-foreground">
            Quản lý danh sách các nhãn sản phẩm trong hệ thống
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm nhãn sản phẩm..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhãn sản phẩm
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
                      Tên nhãn sản phẩm
                      {sortColumn === "name" && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${
                            sortDirection === "desc" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Mã màu</TableHead>
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
                        <Skeleton className="h-4 w-16" />
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
                ) : productLabelsData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Không có nhãn sản phẩm nào. Hãy thêm nhãn sản phẩm mới.
                    </TableCell>
                  </TableRow>
                ) : (
                  productLabelsData?.data?.map((productLabel: any) => (
                    <TableRow key={productLabel.id}>
                      <TableCell>{productLabel.id}</TableCell>
                      <TableCell className="font-medium">
                        {productLabel.name}
                      </TableCell>
                      <TableCell>
                        {productLabel.color_code ? (
                          <Badge
                            style={{
                              backgroundColor: productLabel.color_code,
                              color: "white",
                            }}
                          >
                            {productLabel.color_code}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDate(productLabel.created_at)}
                      </TableCell>
                      <TableCell>
                        {formatDate(productLabel.updated_at)}
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
                              onClick={() => handleEdit(productLabel)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDelete(productLabel)}
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
        {!isLoading && productLabelsData?.data?.length > 0 && (
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

      {/* Create Product Label Dialog */}
      <ProductLabelDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />

      {/* Edit Product Label Dialog */}
      {selectedProductLabel && (
        <ProductLabelDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mode="edit"
          productLabel={selectedProductLabel}
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
              Thao tác này sẽ xóa nhãn sản phẩm "{selectedProductLabel?.name}"
              và không thể hoàn tác.
              {selectedProductLabel?.product_count > 0 && (
                <span className="text-destructive font-medium block mt-2">
                  Cảnh báo: Nhãn sản phẩm này đang được sử dụng bởi{" "}
                  {selectedProductLabel.product_count} sản phẩm. Việc xóa có thể
                  ảnh hưởng đến dữ liệu liên quan.
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
