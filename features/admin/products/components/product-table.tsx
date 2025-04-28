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
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Plus,
  Minus,
  Save,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useProductHardDelete } from "../hooks/use-product-hard-delete";
import { useUpdateProductVariant } from "../hooks/use-product-variants";

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
  const productHardDelete = useProductHardDelete();
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

  // State cho việc chỉnh sửa nhanh số lượng tồn kho
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null);
  const [editingStockQuantity, setEditingStockQuantity] = useState<string>("");
  const updateVariantMutation = useUpdateProductVariant();

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
    // Khi khôi phục, luôn đặt restoreVariants thành true để tự động tích chọn
    if (mode === "restore") setRestoreVariants(true);
    // Mở dialog ngay lập tức
    setDeleteDialogOpen(true);
    // Nếu hard delete, chạy validation sau khi mở dialog
    if (mode === "hard") {
      productHardDelete.prepareDelete(product.id);
    }
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
        // perform hard delete via hook
        await productHardDelete.confirmDelete();
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
      return {
        status: "Chưa có biến thể",
        color: "default",
        icon: <Info className="h-4 w-4 mr-1.5" />,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
      };
    }

    // Chỉ tính các biến thể chưa bị xóa nếu product đang hiển thị (chưa bị xóa)
    const activeVariants = !product.deleted_at
      ? product.variants.filter((v: any) => !v.deleted_at)
      : product.variants;

    if (activeVariants.length === 0) {
      return {
        status: "Không có biến thể hiển thị",
        color: "default",
        icon: <Info className="h-4 w-4 mr-1.5" />,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
      };
    }

    // Phân loại biến thể theo trạng thái tồn kho
    const outOfStockVariants = activeVariants.filter(
      (v: any) => v.stock_quantity === 0
    );
    const lowStockVariants = activeVariants.filter(
      (v: any) => v.stock_quantity > 0 && v.stock_quantity < 5
    );
    const healthyStockVariants = activeVariants.filter(
      (v: any) => v.stock_quantity >= 5
    );

    // Tính tổng tồn kho
    const totalStock = activeVariants.reduce(
      (sum: number, variant: any) => sum + (variant.stock_quantity || 0),
      0
    );

    // Thống kê số lượng biến thể theo trạng thái
    const outOfStockCount = outOfStockVariants.length;
    const lowStockCount = lowStockVariants.length;
    const variantsCount = activeVariants.length;

    // Thống kê thêm về tình trạng tồn kho
    const stockStats = {
      total: totalStock,
      avgPerVariant:
        totalStock > 0 ? Math.round((totalStock / variantsCount) * 10) / 10 : 0,
      lowStockCount,
      outOfStockCount,
      healthyCount: healthyStockVariants.length,
      lowStockPercent: Math.round((lowStockCount / variantsCount) * 100),
      outOfStockPercent: Math.round((outOfStockCount / variantsCount) * 100),
      healthyPercent: Math.round(
        (healthyStockVariants.length / variantsCount) * 100
      ),
    };

    // Đánh giá trạng thái tồn kho tổng thể
    if (totalStock === 0) {
      return {
        status: `Hết hàng (${variantsCount} biến thể)`,
        color: "destructive",
        icon: <XCircle className="h-4 w-4 mr-1.5" />,
        detail: `${outOfStockCount}/${variantsCount} biến thể hết hàng`,
        variantStats: {
          outOfStock: outOfStockCount,
          lowStock: lowStockCount,
          healthy: healthyStockVariants.length,
          total: variantsCount,
        },
        stockStats,
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-200",
      };
    } else if (outOfStockCount > 0) {
      // Có biến thể đã hết hàng
      return {
        status: `${outOfStockCount} biến thể hết hàng (${totalStock})`,
        color: "warning",
        icon: <AlertTriangle className="h-4 w-4 mr-1.5" />,
        detail: `${outOfStockCount}/${variantsCount} biến thể đã hết hàng, còn ${totalStock} sản phẩm ở các biến thể khác`,
        variantStats: {
          outOfStock: outOfStockCount,
          lowStock: lowStockCount,
          healthy: healthyStockVariants.length,
          total: variantsCount,
        },
        stockStats,
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
      };
    } else if (lowStockCount > 0) {
      // Có biến thể sắp hết hàng
      return {
        status: `${lowStockCount} biến thể sắp hết (${totalStock})`,
        color: "warning",
        icon: <AlertCircle className="h-4 w-4 mr-1.5" />,
        detail: `${lowStockCount}/${variantsCount} biến thể sắp hết hàng, tổng còn ${totalStock} sản phẩm`,
        variantStats: {
          outOfStock: outOfStockCount,
          lowStock: lowStockCount,
          healthy: healthyStockVariants.length,
          total: variantsCount,
        },
        stockStats,
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-700",
        borderColor: "border-yellow-200",
      };
    } else {
      // Tất cả đều ổn
      return {
        status: `Còn hàng (${totalStock})`,
        color: "success",
        icon: <CheckCircle2 className="h-4 w-4 mr-1.5" />,
        detail: `${variantsCount} biến thể có đủ hàng, tổng ${totalStock} sản phẩm`,
        variantStats: {
          outOfStock: outOfStockCount,
          lowStock: lowStockCount,
          healthy: healthyStockVariants.length,
          total: variantsCount,
        },
        stockStats,
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-200",
      };
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
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <Badge
                                  variant={stockStatus.color as any}
                                  className={`flex items-center gap-1 ${stockStatus.bgColor} ${stockStatus.textColor} hover:${stockStatus.bgColor} border ${stockStatus.borderColor}`}
                                >
                                  {stockStatus.icon}
                                  {stockStatus.status}
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="p-3 w-64">
                              <div className="space-y-2">
                                <p className="font-semibold mb-1 border-b pb-1">
                                  Chi tiết tồn kho:
                                </p>
                                <p className={stockStatus.textColor}>
                                  {stockStatus.detail || stockStatus.status}
                                </p>

                                {product.variants &&
                                  product.variants.length > 0 && (
                                    <>
                                      <div className="mt-2 pt-2 border-t">
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                              Tổng tồn kho:
                                            </span>
                                            <span className="font-medium">
                                              {stockStatus.stockStats?.total}{" "}
                                              sản phẩm
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">
                                              Trung bình:
                                            </span>
                                            <span className="font-medium">
                                              {
                                                stockStatus.stockStats
                                                  ?.avgPerVariant
                                              }
                                              /biến thể
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-1.5">
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="text-sm">
                                            {stockStatus.variantStats?.healthy}/
                                            {stockStatus.variantStats?.total}{" "}
                                            biến thể đủ hàng
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                          <span className="text-sm">
                                            {stockStatus.variantStats?.lowStock}
                                            /{stockStatus.variantStats?.total}{" "}
                                            biến thể sắp hết
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                          <span className="text-sm">
                                            {
                                              stockStatus.variantStats
                                                ?.outOfStock
                                            }
                                            /{stockStatus.variantStats?.total}{" "}
                                            biến thể hết hàng
                                          </span>
                                        </div>
                                      </div>

                                      {product.variants &&
                                        product.variants.length > 0 && (
                                          <div className="mt-2 pt-2 border-t space-y-1">
                                            <p className="text-xs font-medium">
                                              Chi tiết biến thể:
                                            </p>
                                            <div className="max-h-32 overflow-y-auto pr-1">
                                              {product.variants.map(
                                                (variant: any) => (
                                                  <div
                                                    key={variant.id}
                                                    className="flex justify-between text-xs py-0.5 border-b border-dashed last:border-0"
                                                  >
                                                    <span>
                                                      {variant.volume_ml}ml:
                                                    </span>
                                                    <span
                                                      className={
                                                        variant.stock_quantity ===
                                                        0
                                                          ? "text-red-500 font-medium"
                                                          : variant.stock_quantity <
                                                            5
                                                          ? "text-yellow-500 font-medium"
                                                          : "text-green-600"
                                                      }
                                                    >
                                                      {variant.stock_quantity}{" "}
                                                      {variant.stock_quantity ===
                                                        0 && (
                                                        <XCircle className="inline h-3 w-3 ml-0.5" />
                                                      )}
                                                    </span>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}
                                    </>
                                  )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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

                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-2">
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

                        <div className="flex items-center gap-1 mt-1">
                          {stockStatus.icon}
                          <div className="flex-1">
                            <div className="text-xs flex items-center gap-1">
                              <span
                                className={`font-medium ${stockStatus.textColor}`}
                              >
                                {stockStatus.detail || stockStatus.status}
                              </span>
                            </div>
                          </div>
                        </div>
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
          </AlertDialogHeader>

          {deleteMode === "hard" && (
            <div className="space-y-4">
              {productHardDelete.isChecking ? (
                <div className="flex flex-col items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                  <p>Đang kiểm tra điều kiện xóa...</p>
                </div>
              ) : productHardDelete.validationResult ? (
                productHardDelete.validationResult.canDelete ? (
                  <div>
                    <AlertDialogDescription className="text-destructive font-medium">
                      CẢNH BÁO: Đây là hành động không thể hoàn tác!
                    </AlertDialogDescription>
                    <div className="text-sm mb-4 mt-4">
                      Xóa vĩnh viễn sẽ:
                      <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Xóa hoàn toàn sản phẩm này khỏi hệ thống</li>
                        <li>
                          Xóa tất cả biến thể, hình ảnh và dữ liệu liên quan
                        </li>
                        <li>
                          Hành động này{" "}
                          <span className="font-bold">không thể khôi phục</span>{" "}
                          sau khi thực hiện
                        </li>
                      </ul>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
                      <div className="flex items-start">
                        <svg
                          className="h-5 w-5 text-red-500 mt-0.5"
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
                          <p className="text-sm font-semibold">
                            Bạn có chắc chắn muốn xóa vĩnh viễn?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-semibold text-destructive mb-2">
                      Không thể xóa vĩnh viễn sản phẩm vì các biến thể sau:
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {productHardDelete.validationResult.variantResults
                        .filter((v) => !v.canDelete)
                        .flatMap((v) => v.blockingReasons)
                        .map((reason, idx) => (
                          <li key={idx} className="text-destructive">
                            {reason}
                          </li>
                        ))}
                    </ul>
                  </div>
                )
              ) : null}
            </div>
          )}

          {deleteMode === "restore" ? (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Bạn có chắc chắn muốn hiển thị lại sản phẩm này không? Sản phẩm
                sẽ xuất hiện trên cửa hàng.
              </div>

              {/* Phần lựa chọn khôi phục biến thể */}
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800/30 mb-4">
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
                    <path d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-3 flex-1">
                    <div className="text-blue-800 dark:text-blue-200 text-sm mb-1">
                      <strong>Lưu ý về biến thể sản phẩm:</strong>
                    </div>
                    <div className="text-blue-800 dark:text-blue-200 text-sm mb-2">
                      Sản phẩm cần có ít nhất một biến thể hoạt động để khách
                      hàng có thể mua được.
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="restoreVariants"
                        checked={true}
                        disabled={true}
                        className="h-4 w-4 rounded border-gray-300 cursor-not-allowed"
                      />
                      <label
                        htmlFor="restoreVariants"
                        className="text-sm font-semibold text-blue-800 dark:text-blue-200"
                      >
                        Khôi phục tất cả biến thể đã ẩn của sản phẩm này (bắt
                        buộc)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            deleteMode === "soft" && (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  Bạn có chắc chắn muốn ẩn sản phẩm này không? Sản phẩm sẽ bị ẩn
                  khỏi cửa hàng nhưng vẫn có thể khôi phục sau.
                </div>
                <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-200 dark:border-amber-800/30 mb-4">
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
                        <strong>Lưu ý:</strong> Sản phẩm này sẽ không xuất hiện
                        trong cửa hàng và khách hàng sẽ không thể tìm thấy hoặc
                        mua nó. Tất cả các biến thể sẽ cũng bị ẩn.
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={
                deleteMode === "hard" &&
                (productHardDelete.isChecking ||
                  (productHardDelete.validationResult &&
                    !productHardDelete.validationResult.canDelete))
              }
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
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
                <div className="mt-6">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Box className="h-4 w-4" />
                    Biến thể sản phẩm ({selectedProduct.variants.length})
                  </h3>

                  {/* Thêm biểu đồ tóm tắt tồn kho */}
                  <div className="mb-4 p-4 border rounded-md bg-card">
                    <h4 className="text-sm font-medium mb-3">
                      Tóm tắt tồn kho
                    </h4>

                    {/* Thêm số liệu tổng quan */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="p-3 rounded-md bg-blue-50 border border-blue-100">
                        <p className="text-xs text-blue-700 mb-1">
                          Tổng tồn kho
                        </p>
                        <p className="text-2xl font-semibold text-blue-600">
                          {selectedProduct.variants.reduce(
                            (sum: number, v: any) =>
                              sum + (v.stock_quantity || 0),
                            0
                          )}
                        </p>
                      </div>

                      <div className="p-3 rounded-md bg-amber-50 border border-amber-100">
                        <p className="text-xs text-amber-700 mb-1">
                          Biến thể chứa hàng
                        </p>
                        <p className="text-2xl font-semibold text-amber-600">
                          {
                            selectedProduct.variants.filter(
                              (v: any) => v.stock_quantity > 0
                            ).length
                          }
                          /{selectedProduct.variants.length}
                        </p>
                      </div>

                      <div className="p-3 rounded-md bg-emerald-50 border border-emerald-100">
                        <p className="text-xs text-emerald-700 mb-1">
                          Trung bình/biến thể
                        </p>
                        <p className="text-2xl font-semibold text-emerald-600">
                          {Math.round(
                            (selectedProduct.variants.reduce(
                              (sum: number, v: any) =>
                                sum + (v.stock_quantity || 0),
                              0
                            ) /
                              selectedProduct.variants.length) *
                              10
                          ) / 10}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">
                          {
                            selectedProduct.variants.filter(
                              (v: any) => v.stock_quantity >= 5
                            ).length
                          }{" "}
                          đủ hàng
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">
                          {
                            selectedProduct.variants.filter(
                              (v: any) =>
                                v.stock_quantity > 0 && v.stock_quantity < 5
                            ).length
                          }{" "}
                          sắp hết
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">
                          {
                            selectedProduct.variants.filter(
                              (v: any) => v.stock_quantity === 0
                            ).length
                          }{" "}
                          hết hàng
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-[repeat(auto-fit,minmax(40px,1fr))] gap-2 h-10 mt-2">
                      {selectedProduct.variants.map((variant: any) => {
                        let bgColor = "bg-red-500";
                        let borderColor = "border-red-600";
                        let textColor = "text-white";

                        if (variant.stock_quantity >= 5) {
                          bgColor = "bg-green-500";
                          borderColor = "border-green-600";
                        } else if (variant.stock_quantity > 0) {
                          bgColor = "bg-yellow-500";
                          borderColor = "border-yellow-600";
                        }

                        return (
                          <TooltipProvider key={variant.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`relative h-full rounded ${bgColor} border ${borderColor} flex items-center justify-center font-medium ${textColor} text-xs`}
                                >
                                  {variant.volume_ml}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="p-2">
                                <div className="text-xs space-y-1">
                                  <div className="font-medium text-sm">
                                    {variant.volume_ml}ml
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span>Tồn kho:</span>
                                    <span
                                      className={
                                        variant.stock_quantity === 0
                                          ? "text-red-500 font-medium"
                                          : variant.stock_quantity < 5
                                          ? "text-yellow-500 font-medium"
                                          : "text-green-600 font-medium"
                                      }
                                    >
                                      {variant.stock_quantity}
                                    </span>
                                  </div>
                                  <div>SKU: {variant.sku || "N/A"}</div>
                                  {variant.deleted_at && (
                                    <div className="text-red-500">Đã ẩn</div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dung tích</TableHead>
                          <TableHead>Giá gốc</TableHead>
                          <TableHead>Giá sale</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Tồn kho</TableHead>
                          <TableHead>Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProduct.variants.map((variant: any) => {
                          // Xác định màu sắc và trạng thái dựa trên số lượng tồn kho
                          let stockStatus = {
                            badge: (
                              <Badge
                                variant="destructive"
                                className="bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                              >
                                Hết hàng
                              </Badge>
                            ),
                            color: "text-red-500",
                            bgColor: "bg-red-50",
                          };

                          if (variant.stock_quantity > 0) {
                            if (variant.stock_quantity < 5) {
                              stockStatus = {
                                badge: (
                                  <Badge
                                    variant="warning"
                                    className="bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-200"
                                  >
                                    Sắp hết
                                  </Badge>
                                ),
                                color: "text-yellow-700",
                                bgColor: "bg-yellow-50",
                              };
                            } else {
                              stockStatus = {
                                badge: (
                                  <Badge
                                    variant="success"
                                    className="bg-green-100 text-green-700 border border-green-200 hover:bg-green-200"
                                  >
                                    Còn hàng
                                  </Badge>
                                ),
                                color: "text-green-700",
                                bgColor: "bg-green-50",
                              };
                            }
                          }

                          return (
                            <TableRow
                              key={variant.id}
                              className={
                                variant.deleted_at ? "bg-muted/40" : ""
                              }
                            >
                              <TableCell>
                                {variant.volume_ml} ml
                                {variant.deleted_at && (
                                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
                                    Đã ẩn
                                  </span>
                                )}
                              </TableCell>
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
                              <TableCell
                                className={`group ${stockStatus.color} ${stockStatus.bgColor} rounded-md px-2 dark:bg-opacity-20 dark:border-opacity-40`}
                              >
                                {editingVariantId === variant.id ? (
                                  <div className="flex items-center gap-1">
                                    <div className="flex border rounded-md overflow-hidden dark:border-border">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 p-0 rounded-none border-r dark:border-border"
                                        onClick={() => {
                                          const currentVal =
                                            parseInt(editingStockQuantity) || 0;
                                          if (currentVal > 0) {
                                            setEditingStockQuantity(
                                              (currentVal - 1).toString()
                                            );
                                          }
                                        }}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={editingStockQuantity}
                                        onChange={(e) => {
                                          // Chỉ cho phép nhập số nguyên không âm
                                          const value = e.target.value.replace(
                                            /[^0-9]/g,
                                            ""
                                          );
                                          // Giới hạn số lượng tồn kho tối đa là 100.000
                                          const numValue = Number(value);
                                          if (numValue <= 100000) {
                                            setEditingStockQuantity(value);
                                          }
                                        }}
                                        className="w-14 h-7 p-0 text-center border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                                        onKeyDown={(e) => {
                                          // Submit khi nhấn Enter
                                          if (e.key === "Enter") {
                                            const saveButton =
                                              e.currentTarget.parentElement?.nextElementSibling?.querySelector(
                                                "button"
                                              );
                                            if (saveButton) {
                                              saveButton.click();
                                            }
                                          }
                                          // Cancel khi nhấn Escape
                                          if (e.key === "Escape") {
                                            setEditingVariantId(null);
                                            setEditingStockQuantity("");
                                          }
                                        }}
                                        autoFocus
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 p-0 rounded-none border-l dark:border-border"
                                        onClick={() => {
                                          const currentVal =
                                            parseInt(editingStockQuantity) || 0;
                                          if (currentVal < 100000) {
                                            setEditingStockQuantity(
                                              (currentVal + 1).toString()
                                            );
                                          }
                                        }}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 p-0 text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                                      onClick={async () => {
                                        try {
                                          // Lấy giá trị số lượng mới
                                          const newQuantity =
                                            parseInt(editingStockQuantity) || 0;

                                          // Không thực hiện cập nhật nếu số lượng không thay đổi
                                          if (
                                            variant.stock_quantity ===
                                            newQuantity
                                          ) {
                                            setEditingVariantId(null);
                                            setEditingStockQuantity("");
                                            return;
                                          }

                                          // Cập nhật biến thể
                                          await updateVariantMutation.mutateAsync(
                                            {
                                              id: variant.id,
                                              product_id: selectedProduct.id,
                                              volume_ml: variant.volume_ml,
                                              price: variant.price,
                                              sale_price:
                                                variant.sale_price || null,
                                              sku: variant.sku || null,
                                              stock_quantity: newQuantity,
                                            }
                                          );

                                          // Cập nhật state của sản phẩm đang xem để hiển thị ngay lập tức
                                          setSelectedProduct((prev) => ({
                                            ...prev,
                                            variants: prev.variants.map(
                                              (v: any) =>
                                                v.id === variant.id
                                                  ? {
                                                      ...v,
                                                      stock_quantity:
                                                        newQuantity,
                                                    }
                                                  : v
                                            ),
                                          }));

                                          // Kết thúc chế độ chỉnh sửa
                                          setEditingVariantId(null);
                                          setEditingStockQuantity("");

                                          toast.success(
                                            "Đã cập nhật số lượng tồn kho",
                                            {
                                              description: `${variant.volume_ml}ml: ${variant.stock_quantity} → ${newQuantity}`,
                                            }
                                          );
                                        } catch (error) {
                                          toast.error("Lỗi cập nhật tồn kho", {
                                            description:
                                              error instanceof Error
                                                ? error.message
                                                : "Đã xảy ra lỗi khi cập nhật số lượng tồn kho",
                                          });
                                        }
                                      }}
                                    >
                                      <Save className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                      onClick={() => {
                                        setEditingVariantId(null);
                                        setEditingStockQuantity("");
                                      }}
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div
                                    className="flex items-center justify-between gap-1 cursor-pointer relative select-none"
                                    onClick={() => {
                                      setEditingVariantId(variant.id);
                                      setEditingStockQuantity(
                                        variant.stock_quantity.toString()
                                      );
                                    }}
                                  >
                                    <span className="font-medium">
                                      {variant.stock_quantity}
                                    </span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 inset-y-0 flex items-center justify-end pr-1 bg-gradient-to-l from-transparent via-transparent to-transparent">
                                      {variant.stock_quantity === 0 ? (
                                        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                      ) : (
                                        <Pencil className="h-3 w-3 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>{stockStatus.badge}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Nút lịch sử kho */}
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5 mr-1"
                      >
                        <rect x="4" y="3" width="16" height="18" rx="2" />
                        <line x1="8" y1="7" x2="16" y2="7" />
                        <line x1="8" y1="11" x2="16" y2="11" />
                        <line x1="8" y1="15" x2="12" y2="15" />
                      </svg>
                      Lịch sử kho
                    </Button>
                  </div>
                </div>
              )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
