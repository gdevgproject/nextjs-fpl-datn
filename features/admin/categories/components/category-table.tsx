"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
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
import { ChevronDown, Edit, Trash, ArrowUpDown, Eye } from "lucide-react";
import { useDeleteCategory } from "../hooks/use-delete-category";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import Image from "next/image";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface CategoryTableProps {
  categories: any[];
  count: number;
  isLoading: boolean;
  isError: boolean;
  error: any;
  page: number;
  pageSize: number;
  sort: { column: string; direction: "asc" | "desc" };
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sort: { column: string; direction: "asc" | "desc" }) => void;
  onEdit: (category: any) => void;
}

export function CategoryTable({
  categories,
  count,
  isLoading,
  isError,
  error,
  page,
  pageSize,
  sort,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onEdit,
}: CategoryTableProps) {
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteCategoryMutation = useDeleteCategory();
  const toast = useSonnerToast();

  // Handle sorting
  const handleSort = (column: string) => {
    if (sort.column === column) {
      onSortChange({
        column,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ column, direction: "asc" });
    }
  };

  // Handle delete button click
  const handleDeleteClick = (category: any) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategoryMutation.mutateAsync({ id: categoryToDelete.id });
      toast.success("Danh mục đã được xóa thành công");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        `Lỗi khi xóa danh mục: ${
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi không xác định"
        }`
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(count / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, count);

  // Get parent category names
  const getParentCategoryName = (parentId: number | null) => {
    if (!parentId) return null;
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : "Unknown";
  };

  // Render loading state
  if (isLoading) {
    return <div className="text-center py-4">Đang tải danh mục...</div>;
  }

  // Render error state
  if (isError) {
    return (
      <div className="text-center py-4 text-red-500">
        Lỗi:{" "}
        {error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi không xác định"}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Tên danh mục
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Danh mục cha</TableHead>
              <TableHead>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => handleSort("display_order")}
                >
                  Thứ tự hiển thị
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Nổi bật</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Không có danh mục nào
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.image_url ? (
                      <Image
                        src={category.image_url || "/placeholder.svg"}
                        alt={category.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {getParentCategoryName(category.parent_category_id) ||
                      "Không có"}
                  </TableCell>
                  <TableCell>{category.display_order}</TableCell>
                  <TableCell>
                    {category.is_featured ? (
                      <Badge variant="default">Nổi bật</Badge>
                    ) : (
                      <Badge variant="outline">Thường</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(category.created_at), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                          <span className="sr-only">Mở menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteClick(category)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
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
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2 border-t">
        <div className="text-sm text-muted-foreground">
          Hiển thị {categories.length > 0 ? startItem : 0} đến {endItem} trong
          tổng số {count} danh mục
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Danh mục "{categoryToDelete?.name}" sẽ bị xóa vĩnh viễn. Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
