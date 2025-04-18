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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowUpDown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useDeleteBanner } from "../hooks/use-delete-banner";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
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
import Image from "next/image";

interface BannerTableProps {
  banners: any[];
  count: number;
  isLoading: boolean;
  isError: boolean;
  page: number;
  pageSize: number;
  sortColumn: string;
  sortDirection: "asc" | "desc";
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (column: string) => void;
  onEdit: (banner: any) => void;
}

export function BannerTable({
  banners,
  count,
  isLoading,
  isError,
  page,
  pageSize,
  sortColumn,
  sortDirection,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onEdit,
}: BannerTableProps) {
  const toast = useSonnerToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<any>(null);
  const deleteBannerMutation = useDeleteBanner();

  // Calculate pagination
  const totalPages = Math.ceil(count / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, count);

  // Handle delete banner
  const handleDeleteClick = (banner: any) => {
    setBannerToDelete(banner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;

    try {
      await deleteBannerMutation.mutateAsync({ id: bannerToDelete.id });
      toast.success("Banner đã được xóa thành công");
      setDeleteDialogOpen(false);
      setBannerToDelete(null);
    } catch (error) {
      toast.error(
        `Lỗi khi xóa banner: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  // Check if banner is currently active based on dates and is_active flag
  const isBannerActive = (banner: any) => {
    if (!banner.is_active) return false;

    const now = new Date();

    if (banner.start_date && new Date(banner.start_date) > now) return false;
    if (banner.end_date && new Date(banner.end_date) < now) return false;

    return true;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hình ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thứ tự hiển thị</TableHead>
              <TableHead>Ngày bắt đầu</TableHead>
              <TableHead>Ngày kết thúc</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Đang tải dữ liệu...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hình ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thứ tự hiển thị</TableHead>
              <TableHead>Ngày bắt đầu</TableHead>
              <TableHead>Ngày kết thúc</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-red-500">
                Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  // Render empty state
  if (banners.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hình ảnh</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thứ tự hiển thị</TableHead>
              <TableHead>Ngày bắt đầu</TableHead>
              <TableHead>Ngày kết thúc</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Không có banner nào. Hãy thêm banner mới.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Hình ảnh</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSortChange("title")}
              >
                <div className="flex items-center">
                  Tiêu đề
                  {renderSortIndicator("title")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSortChange("is_active")}
              >
                <div className="flex items-center">
                  Trạng thái
                  {renderSortIndicator("is_active")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSortChange("display_order")}
              >
                <div className="flex items-center">
                  Thứ tự hiển thị
                  {renderSortIndicator("display_order")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSortChange("start_date")}
              >
                <div className="flex items-center">
                  Ngày bắt đầu
                  {renderSortIndicator("start_date")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => onSortChange("end_date")}
              >
                <div className="flex items-center">
                  Ngày kết thúc
                  {renderSortIndicator("end_date")}
                </div>
              </TableHead>
              <TableHead className="w-[80px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((banner) => (
              <TableRow key={banner.id}>
                <TableCell>
                  {banner.image_url ? (
                    <div className="relative h-16 w-24 overflow-hidden rounded-md">
                      <Image
                        src={banner.image_url || "/placeholder.svg"}
                        alt={banner.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-24 items-center justify-center rounded-md bg-muted">
                      <span className="text-xs text-muted-foreground">
                        No image
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{banner.title}</div>
                  {banner.subtitle && (
                    <div className="text-sm text-muted-foreground">
                      {banner.subtitle}
                    </div>
                  )}
                  {banner.link_url && (
                    <div className="mt-1 text-xs text-blue-500 truncate max-w-[200px]">
                      {banner.link_url}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {isBannerActive(banner) ? (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Đang hiển thị
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <XCircle className="mr-1 h-3 w-3" />
                      Không hiển thị
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{banner.display_order}</TableCell>
                <TableCell>
                  {banner.start_date
                    ? formatDate(banner.start_date)
                    : "Không giới hạn"}
                </TableCell>
                <TableCell>
                  {banner.end_date
                    ? formatDate(banner.end_date)
                    : "Không giới hạn"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Mở menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(banner)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteClick(banner)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị {startItem}-{endItem} trên tổng số {count} banner
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa banner</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa banner "{bannerToDelete?.title}"? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
