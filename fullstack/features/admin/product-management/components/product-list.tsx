"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductBulkActions } from "./product-bulk-actions";
import { ProductFilter } from "./product-filter";
import { Pagination } from "@/components/ui/pagination";
import { ProductFilterData } from "./schemas";
import { useProductList } from "../queries";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { Button as ShadcnButton } from "@/components/ui/button";
import {
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  RotateCcw,
  Image as ImageIcon,
  LayoutList,
} from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ProductListItem } from "../types";
import Image from "next/image";

export function ProductList() {
  const [filter, setFilter] = useState<ProductFilterData>({
    page: 1,
    limit: 10,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Fetch products using React Query
  const { data, isLoading, isError } = useProductList(filter);

  // Clear selections when filter changes
  useEffect(() => {
    setSelectedProducts([]);
  }, [filter]);

  const handleFilterChange = (newFilter: Partial<ProductFilterData>) => {
    setFilter((prev) => ({ ...prev, ...newFilter, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilter((prev) => ({ ...prev, page }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data) {
      setSelectedProducts(data.data.map((product) => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, id]);
    } else {
      setSelectedProducts((prev) =>
        prev.filter((productId) => productId !== id)
      );
    }
  };

  const handleBulkActionComplete = () => {
    setSelectedProducts([]);
  };

  const getLowestPrice = (product: ProductListItem) => {
    if (!product.variants.length) return 0;
    const prices = product.variants.map((v) => v.sale_price ?? v.price);
    return Math.min(...prices);
  };

  const getTotalStock = (product: ProductListItem) => {
    return product.variants.reduce((sum, v) => sum + v.stock_quantity, 0);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="border rounded-md">
          <div className="p-4">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between space-x-4"
                >
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-semibold text-red-500 mb-2">
          Không thể tải danh sách sản phẩm
        </h3>
        <p className="text-muted-foreground mb-4">
          Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mx-auto"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  // Prepare data from the API response
  const products = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quản lý sản phẩm</h2>
          <p className="text-muted-foreground">
            Quản lý danh sách sản phẩm trong cửa hàng
          </p>
        </div>
        <Link href="/admin/san-pham/them">
          <Button className="flex items-center gap-1">
            <Plus size={16} />
            <span>Thêm sản phẩm</span>
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            className="w-80"
            value={filter.search || ""}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
          <Button
            variant="outline"
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-1"
          >
            <Filter size={16} />
            <span>Bộ lọc</span>
          </Button>
          <div className="border rounded-md overflow-hidden flex">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className={`h-9 w-9 rounded-none ${
                viewMode === "list" ? "" : "text-muted-foreground"
              }`}
              onClick={() => setViewMode("list")}
            >
              <LayoutList size={18} />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className={`h-9 w-9 rounded-none ${
                viewMode === "grid" ? "" : "text-muted-foreground"
              }`}
              onClick={() => setViewMode("grid")}
            >
              <ImageIcon size={18} />
            </Button>
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <ProductBulkActions
            selectedProductIds={selectedProducts}
            onActionComplete={handleBulkActionComplete}
          />
        )}
      </div>

      {showFilter && (
        <ProductFilter filter={filter} onFilterChange={handleFilterChange} />
      )}

      {viewMode === "list" ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedProducts.length === products.length &&
                      products.length > 0
                    }
                    indeterminate={
                      selectedProducts.length > 0 &&
                      selectedProducts.length < products.length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Mã</TableHead>
                <TableHead>Thương hiệu</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    Không tìm thấy sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) =>
                          handleSelectProduct(product.id, !!checked)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium flex items-center gap-3">
                        {product.main_image ? (
                          <div className="h-10 w-10 rounded-md border overflow-hidden bg-muted">
                            <Image
                              src={product.main_image}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md border bg-muted flex items-center justify-center text-muted-foreground">
                            <ImageIcon size={18} />
                          </div>
                        )}
                        <span>{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{product.product_code}</TableCell>
                    <TableCell>{product.brand?.name || "-"}</TableCell>
                    <TableCell>
                      <div>
                        {formatPrice(getLowestPrice(product))}
                        {product.has_promotion && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            KM
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getTotalStock(product)}</TableCell>
                    <TableCell>
                      {product.deleted_at ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Đã ẩn
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Hiển thị
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <ShadcnButton variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </ShadcnButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/san-pham/${product.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Chỉnh sửa</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/san-pham/${product.id}`}
                              target="_blank"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              <span>Xem trên trang</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={`${
                              product.deleted_at
                                ? "text-green-600 focus:text-green-600"
                                : "text-red-600 focus:text-red-600"
                            }`}
                            onClick={() => {
                              // Individual delete/restore logic
                              // This will be handled by the detail page
                            }}
                          >
                            {product.deleted_at ? (
                              <>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                <span>Khôi phục</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Xóa</span>
                              </>
                            )}
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-10">
              Không tìm thấy sản phẩm nào
            </div>
          ) : (
            products.map((product) => (
              <Card
                key={product.id}
                className={`overflow-hidden ${
                  product.deleted_at
                    ? "border-dashed border-muted-foreground/30"
                    : ""
                }`}
              >
                <div className="relative">
                  <div className="aspect-square bg-muted relative">
                    {product.main_image ? (
                      <Image
                        src={product.main_image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <ImageIcon size={64} strokeWidth={1} />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) =>
                          handleSelectProduct(product.id, !!checked)
                        }
                      />
                    </div>
                    {product.has_promotion && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        KM
                      </div>
                    )}
                    {product.deleted_at && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/80 text-white px-4 py-2 rounded-full rotate-[-30deg] text-sm font-bold">
                        Đã ẩn
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="font-medium text-white truncate">
                      {product.name}
                    </h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {product.product_code}
                      </p>
                      <p className="text-sm">
                        {product.brand ? product.brand.name : "-"}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(getLowestPrice(product))}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Tồn: {getTotalStock(product)}
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link href={`/admin/san-pham/${product.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link
                          href={`/san-pham/${product.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Hiển thị {products.length} / {total} sản phẩm
        </div>
        <Pagination
          currentPage={filter.page}
          totalPages={Math.ceil(total / filter.limit)}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
