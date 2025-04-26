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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Pencil,
  Trash,
  Undo,
  Eye,
  Grid,
  List,
  Tag,
  Box,
  ExternalLink,
  Info,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";

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
  isDeletedView?: boolean;
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
  isDeletedView = false,
}: ProductTableProps) {
  const toast = useSonnerToast();
  const deleteProductMutation = useDeleteProduct();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [deleteMode, setDeleteMode] = useState<"soft" | "hard" | "restore">(
    "soft"
  );
  const [restoreVariants, setRestoreVariants] = useState(false);

  // State for quick view dialog
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

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
      // Lưu trữ sản phẩm trước khi thực hiện thao tác để cập nhật UI sau đó
      const productBeingModified = { ...productToDelete };

      if (deleteMode === "soft") {
        // Thực hiện ẩn sản phẩm thông qua API
        await deleteProductMutation.softDelete(productToDelete.id);

        // Cập nhật UI ngay lập tức bằng cách đánh dấu sản phẩm và tất cả biến thể của nó là đã ẩn
        if (selectedProduct && selectedProduct.id === productToDelete.id) {
          // Cập nhật trạng thái cho sản phẩm đang xem nhanh (nếu có)
          setSelectedProduct((prev) => ({
            ...prev,
            deleted_at: new Date().toISOString(),
            variants: prev.variants?.map((variant) => ({
              ...variant,
              deleted_at: new Date().toISOString(),
            })),
          }));
        }

        toast.success("Sản phẩm và các biến thể đã được ẩn thành công");
      } else if (deleteMode === "hard") {
        await deleteProductMutation.hardDelete(productToDelete.id);

        // Nếu đang xem nhanh sản phẩm bị xóa vĩnh viễn, đóng dialog xem nhanh
        if (selectedProduct && selectedProduct.id === productToDelete.id) {
          setQuickViewOpen(false);
          setSelectedProduct(null);
        }

        toast.success("Sản phẩm đã được xóa vĩnh viễn thành công");
      } else if (deleteMode === "restore") {
        // Thực hiện khôi phục sản phẩm thông qua API, truyền vào tùy chọn khôi phục tất cả biến thể
        await deleteProductMutation.restore({
          productId: productToDelete.id,
          restoreAllVariants: restoreVariants,
        });

        // Cập nhật UI ngay lập tức bằng cách đánh dấu sản phẩm và biến thể liên quan là đã khôi phục
        if (selectedProduct && selectedProduct.id === productToDelete.id) {
          // Cập nhật trạng thái cho sản phẩm đang xem nhanh (nếu có)
          setSelectedProduct((prev) => ({
            ...prev,
            deleted_at: null,
            // Khôi phục biến thể dựa vào tùy chọn restoreVariants
            variants: prev.variants?.map((variant) => {
              if (restoreVariants) {
                // Nếu đã chọn khôi phục tất cả biến thể, đặt deleted_at thành null cho tất cả
                return {
                  ...variant,
                  deleted_at: null,
                };
              } else {
                // Nếu không, chỉ khôi phục những biến thể đã bị ẩn cùng lúc với sản phẩm
                const variantDeletedTime = variant.deleted_at
                  ? new Date(variant.deleted_at).getTime()
                  : 0;
                const productDeletedTime = productBeingModified.deleted_at
                  ? new Date(productBeingModified.deleted_at).getTime()
                  : 0;

                // Nếu thời gian xóa chênh lệch không quá 5 giây, coi như bị xóa cùng lúc
                const deletedTogether =
                  Math.abs(variantDeletedTime - productDeletedTime) <= 5000;

                return {
                  ...variant,
                  // Chỉ reset deleted_at nếu biến thể đã bị xóa cùng lúc với sản phẩm
                  deleted_at: deletedTogether ? null : variant.deleted_at,
                };
              }
            }),
          }));
        }

        // Reset trạng thái checkbox cho lần sau
        setRestoreVariants(false);

        toast.success(
          "Sản phẩm và các biến thể liên quan đã được hiển thị lại thành công"
        );
      }
    } catch (error) {
      toast.error(
        `Lỗi khi ${
          deleteMode === "restore"
            ? "hiển thị lại"
            : deleteMode === "hard"
            ? "xóa vĩnh viễn"
            : "ẩn"
        } sản phẩm: ${error instanceof Error ? error.message : "Unknown error"}`
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

  // Handle quick view
  const handleQuickView = (product: any) => {
    setSelectedProduct(product);
    setQuickViewOpen(true);
  };

  // Get the main image for a product
  const getMainImage = (product: any) => {
    if (product.images && product.images.length > 0) {
      const mainImage = product.images.find((img: any) => img.is_main);
      if (mainImage) return mainImage.image_url;
      return product.images[0].image_url;
    }
    return "/placeholder.jpg";
  };

  // Format price range
  const formatPriceRange = (product: any) => {
    if (!product.variants || product.variants.length === 0) {
      return "Chưa có biến thể";
    }

    const prices = product.variants.map((v: any) => v.sale_price || v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(minPrice);
    } else {
      return `${new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(minPrice)} - ${new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(maxPrice)}`;
    }
  };

  // Get stock status
  const getStockStatus = (product: any) => {
    if (!product.variants || product.variants.length === 0) {
      return { status: "Chưa có biến thể", color: "default" };
    }

    const totalStock = product.variants.reduce(
      (sum: number, variant: any) => sum + (variant.stock_quantity || 0),
      0
    );

    if (totalStock === 0) {
      return { status: "Hết hàng", color: "destructive" };
    } else if (totalStock < 10) {
      return { status: `Sắp hết (${totalStock})`, color: "warning" };
    } else {
      return { status: `Còn hàng (${totalStock})`, color: "success" };
    }
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị {products.length > 0 ? startItem : 0}-{endItem} trong tổng số{" "}
          {totalCount} sản phẩm
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chế độ danh sách</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chế độ lưới</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead className="w-[60px]">Ảnh</TableHead>
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
                <TableHead>Loại / Nồng độ</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead>Kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    Không tìm thấy sản phẩm nào.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <TableRow
                      key={product.id}
                      className={
                        product.deleted_at
                          ? "bg-muted/40 hover:bg-muted/60"
                          : ""
                      }
                    >
                      <TableCell className="font-medium">
                        {product.id}
                      </TableCell>
                      <TableCell>
                        <div className="relative h-10 w-10">
                          <Image
                            src={getMainImage(product)}
                            alt={product.name}
                            fill
                            className="rounded-md object-cover"
                            sizes="40px"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate font-medium">
                        <div className="flex flex-col">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate">{product.name}</span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-[300px] whitespace-normal">
                                <div className="flex flex-col gap-1">
                                  <span className="font-medium">
                                    {product.name}
                                  </span>
                                  {product.short_description && (
                                    <span className="text-xs text-muted-foreground">
                                      {product.short_description}
                                    </span>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span className="text-xs text-muted-foreground truncate">
                            {product.product_code || "Chưa có mã"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{product.brands?.name || "-"}</TableCell>
                      <TableCell>{product.genders?.name || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span>{product.perfume_types?.name || "-"}</span>
                          <span className="text-xs text-muted-foreground">
                            {product.concentrations?.name || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatPriceRange(product)}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.color as any}>
                          {stockStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.deleted_at ? (
                          <Badge
                            variant="destructive"
                            className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-200"
                          >
                            Đã ẩn
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="bg-green-100 hover:bg-green-200 text-green-700 border border-green-200"
                          >
                            Hoạt động
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleQuickView(product)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Xem nhanh</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 p-0"
                                  onClick={() => onEdit(product)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Chỉnh sửa</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {product.slug && (
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/san-pham/${product.slug}`}
                                    target="_blank"
                                    className="flex items-center"
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Xem trên shop
                                  </Link>
                                </DropdownMenuItem>
                              )}
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
                                    onClick={() =>
                                      handleDeleteClick(product, "hard")
                                    }
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Xóa vĩnh viễn
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    handleDeleteClick(product, "soft")
                                  }
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Ẩn
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              Không tìm thấy sản phẩm nào.
            </div>
          ) : (
            products.map((product) => {
              const stockStatus = getStockStatus(product);
              return (
                <Card
                  key={product.id}
                  className={product.deleted_at ? "bg-muted/30" : ""}
                >
                  <div className="relative p-4 h-[180px]">
                    <Image
                      src={getMainImage(product)}
                      alt={product.name}
                      fill
                      className="object-contain rounded-t-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {product.deleted_at && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border border-red-200">
                          Đã ẩn
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="pt-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-medium leading-tight truncate"
                          title={product.name}
                        >
                          {product.name}
                        </h3>
                        <Badge
                          variant={stockStatus.color as any}
                          className="whitespace-nowrap flex-shrink-0"
                        >
                          {stockStatus.status}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {product.brands?.name || "Chưa có thương hiệu"} •{" "}
                        {product.concentrations?.name || "Chưa phân loại"}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <Tag className="h-3.5 w-3.5" />
                        <span className="font-medium">
                          {formatPriceRange(product)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Box className="h-3.5 w-3.5" />
                        <span className="text-sm">
                          {product.variants?.length || 0} biến thể • ID:{" "}
                          {product.id}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickView(product)}
                    >
                      <Eye className="mr-2 h-3.5 w-3.5" />
                      Xem nhanh
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onEdit(product)}
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Chỉnh sửa
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Hiển thị</span>
          <select
            className="h-8 w-16 rounded-md border border-input bg-background px-2 text-xs"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-muted-foreground">
            sản phẩm mỗi trang
          </span>
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
              {deleteMode === "hard"
                ? "Xóa vĩnh viễn sản phẩm"
                : deleteMode === "restore"
                ? "Hiển thị lại sản phẩm"
                : "Ẩn sản phẩm"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteMode === "hard" ? (
                <div className="space-y-3">
                  <div>
                    Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm này không? Hành
                    động này không thể hoàn tác.
                  </div>
                  <div className="rounded-md bg-destructive/10 p-3 border border-destructive/20">
                    <div className="flex">
                      <svg
                        className="h-5 w-5 text-destructive mt-0.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      <div className="ml-3">
                        <div className="text-destructive text-sm">
                          <strong>Cảnh báo:</strong> Tất cả dữ liệu liên quan
                          đến sản phẩm này sẽ bị xóa vĩnh viễn, bao gồm biến
                          thể, hình ảnh, đánh giá, và các thông tin khác.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : deleteMode === "restore" ? (
                <div className="space-y-3">
                  <div>
                    Bạn có chắc chắn muốn hiển thị lại sản phẩm này không? Sản
                    phẩm sẽ xuất hiện trên cửa hàng.
                  </div>

                  {/* Phần lựa chọn khôi phục biến thể */}
                  <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800/30">
                    <div className="flex">
                      <svg
                        className="h-5 w-5 text-blue-500 mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="ml-3 flex-1">
                        <div className="text-blue-800 dark:text-blue-200 text-sm mb-1">
                          <strong>Lưu ý về biến thể sản phẩm:</strong>
                        </div>
                        <div className="text-blue-800 dark:text-blue-200 text-sm mb-2">
                          Sản phẩm cần có ít nhất một biến thể hoạt động để
                          khách hàng có thể mua được. Vui lòng lựa chọn:
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="restoreVariants"
                            checked={restoreVariants}
                            onChange={(e) =>
                              setRestoreVariants(e.target.checked)
                            }
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <label htmlFor="restoreVariants" className="text-sm">
                            Khôi phục tất cả biến thể đã ẩn của sản phẩm này
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    Bạn có chắc chắn muốn ẩn sản phẩm này không? Sản phẩm sẽ bị
                    ẩn khỏi cửa hàng nhưng vẫn có thể khôi phục sau.
                  </div>
                  <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-200 dark:border-amber-800/30">
                    <div className="flex">
                      <svg
                        className="h-5 w-5 text-amber-500 mt-0.5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      <div className="ml-3">
                        <div className="text-amber-800 dark:text-amber-200 text-sm">
                          <strong>Lưu ý:</strong> Sản phẩm này sẽ không xuất
                          hiện trong cửa hàng và khách hàng sẽ không thể tìm
                          thấy hoặc mua nó. Tất cả các biến thể sẽ cũng bị ẩn.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className={
                deleteMode === "hard"
                  ? "bg-red-600 hover:bg-red-700"
                  : deleteMode === "restore"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }
            >
              {deleteMode === "hard"
                ? "Xóa vĩnh viễn"
                : deleteMode === "restore"
                ? "Hiển thị lại"
                : "Ẩn sản phẩm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick View Dialog */}
      {selectedProduct && (
        <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>
                ID: {selectedProduct.id} •{" "}
                {selectedProduct.product_code || "Chưa có mã"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative aspect-square">
                <Image
                  src={getMainImage(selectedProduct)}
                  alt={selectedProduct.name}
                  fill
                  className="object-contain rounded-lg border"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Thương hiệu
                    </h4>
                    <p>
                      {selectedProduct.brands?.name || "Chưa có thương hiệu"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Giới tính
                    </h4>
                    <p>{selectedProduct.genders?.name || "Chưa phân loại"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Loại nước hoa
                    </h4>
                    <p>
                      {selectedProduct.perfume_types?.name || "Chưa phân loại"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Nồng độ
                    </h4>
                    <p>
                      {selectedProduct.concentrations?.name || "Chưa phân loại"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Giá bán
                    </h4>
                    <p className="font-medium">
                      {formatPriceRange(selectedProduct)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Tình trạng kho
                    </h4>
                    <Badge
                      variant={getStockStatus(selectedProduct).color as any}
                    >
                      {getStockStatus(selectedProduct).status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Xuất xứ
                    </h4>
                    <p>
                      {selectedProduct.origin_country || "Chưa có thông tin"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Năm phát hành
                    </h4>
                    <p>{selectedProduct.release_year || "Chưa có thông tin"}</p>
                  </div>
                </div>

                {selectedProduct.short_description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Mô tả ngắn
                    </h4>
                    <p className="text-sm">
                      {selectedProduct.short_description}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/san-pham/${selectedProduct.slug}`}
                      target="_blank"
                      className="flex items-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Xem trên shop
                    </Link>
                  </Button>
                  <Button size="sm" onClick={() => onEdit(selectedProduct)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                </div>
              </div>
            </div>

            {selectedProduct.variants &&
              selectedProduct.variants.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Box className="h-4 w-4" />
                    Biến thể sản phẩm ({selectedProduct.variants.length})
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dung tích</TableHead>
                          <TableHead>Giá gốc</TableHead>
                          <TableHead>Giá sale</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Tồn kho</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProduct.variants.map((variant: any) => (
                          <TableRow key={variant.id}>
                            <TableCell>{variant.volume_ml} ml</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(variant.price)}
                            </TableCell>
                            <TableCell>
                              {variant.sale_price
                                ? new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(variant.sale_price)
                                : "-"}
                            </TableCell>
                            <TableCell>{variant.sku || "-"}</TableCell>
                            <TableCell>
                              {variant.stock_quantity === 0 ? (
                                <Badge variant="destructive">Hết hàng</Badge>
                              ) : variant.stock_quantity < 10 ? (
                                <Badge variant="warning">
                                  Sắp hết ({variant.stock_quantity})
                                </Badge>
                              ) : (
                                <Badge variant="success">
                                  Còn hàng ({variant.stock_quantity})
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
