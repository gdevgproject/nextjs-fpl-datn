"use client";

import { useState, useEffect } from "react";
import { useProducts } from "../hooks/use-products";
import { useDebounce } from "../hooks/use-debounce";
import { ProductTable } from "./product-table";
import { ProductDialog } from "./product-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Download,
  UploadCloud,
  HelpCircle,
} from "lucide-react";
import { useBrands } from "../../brands/hooks/use-brands";
import { useGenders } from "../../genders/hooks/use-genders";
import { usePerfumeTypes } from "../../perfume-types/hooks/use-perfume-types";
import { useConcentrations } from "../../concentrations/hooks/use-concentrations";
import { useCategories } from "../../categories/hooks/use-categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ProductManagement() {
  // State for search and filters
  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState<number | undefined>(undefined);
  const [genderId, setGenderId] = useState<number | undefined>(undefined);
  const [perfumeTypeId, setPerfumeTypeId] = useState<number | undefined>(
    undefined
  );
  const [concentrationId, setConcentrationId] = useState<number | undefined>(
    undefined
  );
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const debouncedSearch = useDebounce(search, 500);

  // State for pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State for sorting
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // State for product dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // State for view mode (default to grid if screen is large)
  const [defaultView, setDefaultView] = useState<"table" | "grid">("grid");

  // Update active filters count when filters change
  useEffect(() => {
    let count = 0;
    if (brandId !== undefined) count++;
    if (genderId !== undefined) count++;
    if (perfumeTypeId !== undefined) count++;
    if (concentrationId !== undefined) count++;
    if (categoryId !== undefined) count++;
    if (includeDeleted) count++;
    setActiveFiltersCount(count);
  }, [
    brandId,
    genderId,
    perfumeTypeId,
    concentrationId,
    categoryId,
    includeDeleted,
  ]);

  // Fetch products with filters, pagination, and sorting
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useProducts(
    {
      search: debouncedSearch,
      brandId,
      genderId,
      perfumeTypeId,
      concentrationId,
      categoryId,
      includeDeleted,
    },
    { page, pageSize },
    { column: sortColumn, direction: sortDirection }
  );

  // Fetch filter options
  const { data: brandsData, isLoading: isLoadingBrands } = useBrands();
  const { data: gendersData, isLoading: isLoadingGenders } = useGenders();
  const { data: perfumeTypesData, isLoading: isLoadingPerfumeTypes } =
    usePerfumeTypes();
  const { data: concentrationsData, isLoading: isLoadingConcentrations } =
    useConcentrations();
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCategories();

  // Handle sort change
  const handleSortChange = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Handle edit product
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  // Handle create new product
  const handleCreateProduct = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch("");
    setBrandId(undefined);
    setGenderId(undefined);
    setPerfumeTypeId(undefined);
    setConcentrationId(undefined);
    setCategoryId(undefined);
    setIncludeDeleted(false);
    setPage(1);
  };

  // Calculate stats
  const totalProducts = productsData?.count || 0;
  const totalDeleted = includeDeleted
    ? productsData?.data.filter((p) => p.deleted_at).length || 0
    : 0;

  // Check if filters are loading
  const isFilterOptionsLoading =
    isLoadingBrands ||
    isLoadingGenders ||
    isLoadingPerfumeTypes ||
    isLoadingConcentrations ||
    isLoadingCategories;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Quản lý sản phẩm
          </h2>
          <p className="text-muted-foreground">
            Tạo, chỉnh sửa và quản lý danh sách sản phẩm
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreateProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số sản phẩm
            </CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {totalDeleted > 0 && `Bao gồm ${totalDeleted} sản phẩm đã xóa`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tồn kho</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold">
                {productsData?.data.reduce((count, product) => {
                  const productStock =
                    product.variants?.reduce(
                      (sum, variant) => sum + (variant.stock_quantity || 0),
                      0
                    ) || 0;
                  return count + productStock;
                }, 0) || 0}
              </div>
              <div className="text-sm text-muted-foreground">đơn vị</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Tổng số lượng tồn kho
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Thương hiệu nổi bật
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="h-[52px] flex items-center">
                <span className="text-xs">Đang tải...</span>
              </div>
            ) : (
              <>
                <div className="space-x-1">
                  {getTopBrands(productsData?.data || []).map((brand, i) => (
                    <Badge key={i} variant="outline">
                      {brand}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Thương hiệu với nhiều sản phẩm nhất
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-1/2 xl:w-2/3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm theo tên sản phẩm..."
              className="pl-8 pr-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to first page on new search
              }}
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-10 px-3"
                onClick={() => setSearch("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2 xl:w-1/3 flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Bộ lọc
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Lọc sản phẩm</SheetTitle>
                <SheetDescription>
                  Tinh chỉnh danh sách sản phẩm với các bộ lọc
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="basic">Cơ bản</TabsTrigger>
                    <TabsTrigger value="advanced">Nâng cao</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Thương hiệu</Label>
                        <Select
                          value={brandId?.toString() || ""}
                          onValueChange={(value) =>
                            setBrandId(
                              value ? Number.parseInt(value) : undefined
                            )
                          }
                        >
                          <SelectTrigger id="brand">
                            <SelectValue placeholder="Tất cả thương hiệu" />
                          </SelectTrigger>
                          <SelectContent>
                            <ScrollArea className="h-72">
                              <SelectItem value="0">
                                Tất cả thương hiệu
                              </SelectItem>
                              {isLoadingBrands ? (
                                <SelectItem value="loading" disabled>
                                  Đang tải...
                                </SelectItem>
                              ) : (
                                brandsData?.data?.map((brand: any) => (
                                  <SelectItem
                                    key={brand.id}
                                    value={brand.id.toString()}
                                  >
                                    {brand.name}
                                  </SelectItem>
                                ))
                              )}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Giới tính</Label>
                        <Select
                          value={genderId?.toString() || ""}
                          onValueChange={(value) =>
                            setGenderId(
                              value ? Number.parseInt(value) : undefined
                            )
                          }
                        >
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Tất cả giới tính" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Tất cả giới tính</SelectItem>
                            {isLoadingGenders ? (
                              <SelectItem value="loading" disabled>
                                Đang tải...
                              </SelectItem>
                            ) : (
                              gendersData?.data?.map((gender: any) => (
                                <SelectItem
                                  key={gender.id}
                                  value={gender.id.toString()}
                                >
                                  {gender.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="perfumeType">Loại nước hoa</Label>
                        <Select
                          value={perfumeTypeId?.toString() || ""}
                          onValueChange={(value) =>
                            setPerfumeTypeId(
                              value ? Number.parseInt(value) : undefined
                            )
                          }
                        >
                          <SelectTrigger id="perfumeType">
                            <SelectValue placeholder="Tất cả loại" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Tất cả loại</SelectItem>
                            {isLoadingPerfumeTypes ? (
                              <SelectItem value="loading" disabled>
                                Đang tải...
                              </SelectItem>
                            ) : (
                              perfumeTypesData?.data?.map((type: any) => (
                                <SelectItem
                                  key={type.id}
                                  value={type.id.toString()}
                                >
                                  {type.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="concentration">Nồng độ</Label>
                        <Select
                          value={concentrationId?.toString() || ""}
                          onValueChange={(value) =>
                            setConcentrationId(
                              value ? Number.parseInt(value) : undefined
                            )
                          }
                        >
                          <SelectTrigger id="concentration">
                            <SelectValue placeholder="Tất cả nồng độ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Tất cả nồng độ</SelectItem>
                            {isLoadingConcentrations ? (
                              <SelectItem value="loading" disabled>
                                Đang tải...
                              </SelectItem>
                            ) : (
                              concentrationsData?.data?.map(
                                (concentration: any) => (
                                  <SelectItem
                                    key={concentration.id}
                                    value={concentration.id.toString()}
                                  >
                                    {concentration.name}
                                  </SelectItem>
                                )
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Danh mục</Label>
                        <Select
                          value={categoryId?.toString() || ""}
                          onValueChange={(value) =>
                            setCategoryId(
                              value ? Number.parseInt(value) : undefined
                            )
                          }
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Tất cả danh mục" />
                          </SelectTrigger>
                          <SelectContent>
                            <ScrollArea className="h-72">
                              <SelectItem value="0">Tất cả danh mục</SelectItem>
                              {isLoadingCategories ? (
                                <SelectItem value="loading" disabled>
                                  Đang tải...
                                </SelectItem>
                              ) : (
                                categoriesData?.data?.map((category: any) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id.toString()}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))
                              )}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator className="my-2" />

                      <div>
                        <h3 className="text-sm font-semibold mb-3">
                          Trạng thái sản phẩm
                        </h3>

                        <div className="rounded-md border p-4 space-y-3">
                          <p className="text-xs text-muted-foreground">
                            Sử dụng tab "Đã ẩn" và "Đang hoạt động" ở phía dưới để xem các sản phẩm theo trạng thái hiển thị.
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tab "Đã ẩn" sẽ hiển thị tất cả các sản phẩm đã bị ẩn và các sản phẩm có biến thể đã bị ẩn.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <SheetFooter className="mt-4 sm:justify-between flex-row gap-2">
                <Button
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="flex-1"
                >
                  Đặt lại
                </Button>
                <SheetClose asChild>
                  <Button type="submit" className="flex-1">
                    Áp dụng
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <Button variant="outline" onClick={() => handleResetFilters()}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">
            Bộ lọc đang áp dụng:
          </span>
          {brandId !== undefined && brandsData?.data && (
            <FilterTag
              label={`Thương hiệu: ${
                brandsData.data.find((b: any) => b.id === brandId)?.name ||
                brandId
              }`}
              onRemove={() => setBrandId(undefined)}
            />
          )}
          {genderId !== undefined && gendersData?.data && (
            <FilterTag
              label={`Giới tính: ${
                gendersData.data.find((g: any) => g.id === genderId)?.name ||
                genderId
              }`}
              onRemove={() => setGenderId(undefined)}
            />
          )}
          {perfumeTypeId !== undefined && perfumeTypesData?.data && (
            <FilterTag
              label={`Loại: ${
                perfumeTypesData.data.find((t: any) => t.id === perfumeTypeId)
                  ?.name || perfumeTypeId
              }`}
              onRemove={() => setPerfumeTypeId(undefined)}
            />
          )}
          {concentrationId !== undefined && concentrationsData?.data && (
            <FilterTag
              label={`Nồng độ: ${
                concentrationsData.data.find(
                  (c: any) => c.id === concentrationId
                )?.name || concentrationId
              }`}
              onRemove={() => setConcentrationId(undefined)}
            />
          )}
          {categoryId !== undefined && categoriesData?.data && (
            <FilterTag
              label={`Danh mục: ${
                categoriesData.data.find((c: any) => c.id === categoryId)
                  ?.name || categoryId
              }`}
              onRemove={() => setCategoryId(undefined)}
            />
          )}
          {includeDeleted && (
            <FilterTag
              label="Chỉ hiển thị đã xóa"
              onRemove={() => setIncludeDeleted(false)}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleResetFilters}
          >
            Xóa tất cả
          </Button>
        </div>
      )}

      {/* Products Table with Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4 grid grid-cols-2 md:w-fit">
          <TabsTrigger
            value="active"
            onClick={() => {
              setIncludeDeleted(false);
              setPage(1);
            }}
            className="flex items-center gap-2"
          >
            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
            Đang hoạt động
          </TabsTrigger>
          <TabsTrigger
            value="deleted"
            onClick={() => {
              setIncludeDeleted(true);
              setPage(1);
            }}
            className="flex items-center gap-2"
          >
            <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
            Đã ẩn
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ProductTable
            products={productsData?.data || []}
            isLoading={isLoadingProducts}
            isError={isProductsError}
            totalCount={productsData?.count || 0}
            page={page}
            pageSize={pageSize}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortChange={handleSortChange}
            onEdit={handleEditProduct}
          />
        </TabsContent>

        <TabsContent value="deleted">
          <ProductTable
            products={productsData?.data || []}
            isLoading={isLoadingProducts}
            isError={isProductsError}
            totalCount={productsData?.count || 0}
            page={page}
            pageSize={pageSize}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSortChange={handleSortChange}
            onEdit={handleEditProduct}
            isDeletedView={true}
          />
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editingProduct ? "edit" : "create"}
        product={editingProduct}
      />
    </div>
  );
}

// Helper component for filter tags
function FilterTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge variant="outline" className="pl-2 pr-1 h-7">
      <span>{label}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="ml-1 h-4 w-4 p-0 rounded-full"
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
}

// Helper function to get top brands
function getTopBrands(products: any[]): string[] {
  if (!products.length) return [];

  // Count occurrences of each brand
  const brandCounts = products.reduce(
    (acc: Record<string, number>, product) => {
      const brandName = product.brands?.name;
      if (brandName) {
        acc[brandName] = (acc[brandName] || 0) + 1;
      }
      return acc;
    },
    {}
  );

  // Sort brands by count and take top 3
  return Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((entry) => entry[0]);
}

// Missing import components
function Box(props: any) {
  return <div {...props} />;
}

function Package(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function Award(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}
