"use client";

import { useState } from "react";
import { useDeleteProduct } from "../hooks/use-delete-product";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Pencil,
  Trash,
  Undo,
} from "lucide-react";

interface ProductTableProps {
  products: any[];
  isLoading: boolean;
  isError: boolean;
  totalCount: number;
  page: number;
  pageSize: number;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (column: string) => void;
  onEdit: (product: any) => void;
}

export function ProductTable({
  products,
  isLoading,
  isError,
  totalCount,
  page,
  pageSize,
  sortColumn,
  sortDirection,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onEdit,
}: ProductTableProps) {
  const toast = useSonnerToast();
  const deleteProductMutation = useDeleteProduct();

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [deleteMode, setDeleteMode] = useState<"soft" | "hard" | "restore">(
    "soft"
  );

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalCount);

  // Handle sort header click
  const handleSortHeader = (column: string) => {
    onSortChange(column);
  };

  // Get sort icon for column
  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  // Handle delete button click
  const handleDeleteClick = (
    product: any,
    mode: "soft" | "hard" | "restore"
  ) => {
    setProductToDelete(product);
    setDeleteMode(mode);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      if (deleteMode === "soft") {
        await deleteProductMutation.softDelete(productToDelete.id);
        toast.success("Sản phẩm đã được xóa tạm thời");
      } else if (deleteMode === "hard") {
        await deleteProductMutation.hardDelete(productToDelete.id);
        toast.success("Sản phẩm đã được xóa vĩnh viễn");
      } else if (deleteMode === "restore") {
        await deleteProductMutation.restore(productToDelete.id);
        toast.success("Sản phẩm đã được khôi phục");
      }
    } catch (error) {
      toast.error(
        `Lỗi khi ${deleteMode === "restore" ? "khôi phục" : "xóa"} sản phẩm: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Handle page change
  const handlePrevPage = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">
          Đã xảy ra lỗi khi tải dữ liệu sản phẩm.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSortHeader("name")}
              >
                <div className="flex items-center">
                  Tên sản phẩm
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead>Thương hiệu</TableHead>
              <TableHead>Giới tính</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Nồng độ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Không tìm thấy sản phẩm nào.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow
                  key={product.id}
                  className={product.deleted_at ? "bg-muted/50" : ""}
                >
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.brands?.name || "-"}</TableCell>
                  <TableCell>{product.genders?.name || "-"}</TableCell>
                  <TableCell>{product.perfume_types?.name || "-"}</TableCell>
                  <TableCell>{product.concentrations?.name || "-"}</TableCell>
                  <TableCell>
                    {product.deleted_at ? (
                      <Badge variant="destructive">Đã xóa</Badge>
                    ) : (
                      <Badge variant="default">Hoạt động</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        {product.deleted_at ? (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteClick(product, "restore")
                              }
                            >
                              <Undo className="mr-2 h-4 w-4" />
                              Khôi phục
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteClick(product, "hard")}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Xóa vĩnh viễn
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(product, "soft")}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị {products.length > 0 ? startItem : 0}-{endItem} của{" "}
          {totalCount} sản phẩm
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={page <= 1}
          >
            Trước
          </Button>
          <div className="text-sm">
            Trang {page} / {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page >= totalPages}
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteMode === "restore"
                ? "Khôi phục sản phẩm"
                : deleteMode === "hard"
                ? "Xóa vĩnh viễn sản phẩm"
                : "Xóa sản phẩm"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteMode === "restore"
                ? "Bạn có chắc chắn muốn khôi phục sản phẩm này không?"
                : deleteMode === "hard"
                ? "Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn khỏi hệ thống."
                : "Sản phẩm sẽ bị xóa tạm thời và có thể khôi phục sau."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className={
                deleteMode === "hard" ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              {deleteMode === "restore" ? "Khôi phục" : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
