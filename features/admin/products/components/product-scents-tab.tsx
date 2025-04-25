"use client";

import {
  useProductScents,
  useAddProductScent,
  useRemoveProductScent,
} from "../hooks/use-product-scents";
import { useScents } from "../../scents/hooks/use-scents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  AlertCircle,
  Loader2,
  PlusCircle,
  Trash2,
  Tag,
  Search,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useDebounce } from "../hooks/use-debounce";

interface ProductScentsTabProps {
  productId: number | null | undefined;
}

export function ProductScentsTab({ productId }: ProductScentsTabProps) {
  const [selectedScentId, setSelectedScentId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Get all available scents for dropdown
  const {
    data: scentsData,
    isLoading: isLoadingScents,
    isError: isErrorScents,
  } = useScents({
    search: debouncedSearch,
  });

  // Get scents assigned to this product
  const {
    data: productScentsData,
    isLoading: isLoadingProductScents,
    isError: isErrorProductScents,
  } = useProductScents(productId || null);

  // Mutations for adding/removing scents
  const addScentMutation = useAddProductScent();
  const removeScentMutation = useRemoveProductScent();

  // Handle adding a new scent to the product
  const handleAddScent = async () => {
    if (!productId || !selectedScentId) return;

    try {
      await addScentMutation.mutateAsync({
        productId,
        scentId: parseInt(selectedScentId),
      });

      // Reset the select field after successful addition
      setSelectedScentId("");
    } catch (error) {
      console.error("Failed to add scent:", error);
    }
  };

  // Handle removing a scent from the product
  const handleRemoveScent = async (id: number, scentName?: string) => {
    if (!productId) return;

    try {
      await removeScentMutation.mutateAsync({
        id,
        productId,
      });
    } catch (error) {
      console.error("Failed to remove scent:", error);
    }
  };

  // Handle errors
  if (isErrorScents || isErrorProductScents) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
        <AlertDescription>
          Không thể tải dữ liệu nhóm hương. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  // Get the list of available scents for dropdown
  const availableScents = scentsData?.data || [];

  // Get the list of scents assigned to this product
  const productScents = productScentsData?.data || [];

  // Check if a scent is already assigned to this product
  const isScentAssigned = (scentId: number): boolean => {
    return productScents.some((item) => item.scent_id === scentId);
  };

  // Generate scent options for select dropdown, filtered to exclude already assigned scents
  const scentOptions = availableScents
    .filter((scent) => !isScentAssigned(scent.id))
    .map((scent) => ({
      value: scent.id.toString(),
      label: scent.name,
      description: scent.description,
    }));

  // Group product scents by type or category for better organization (if needed)
  const groupedProductScents = productScents.reduce((acc: any, item: any) => {
    // You could group by first letter, or some other property
    const firstLetter = (item.scent?.name || "")[0]?.toUpperCase() || "#";
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(item);
    return acc;
  }, {});

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Tag className="h-5 w-5" /> Nhóm hương của sản phẩm
        </CardTitle>
        <CardDescription>
          Quản lý các nhóm mùi hương tổng thể cho sản phẩm. Gán nhiều nhóm hương
          giúp khách hàng dễ dàng tìm thấy sản phẩm thông qua bộ lọc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and add new scent section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm nhóm hương..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoadingScents || !productId}
            />
            {isLoadingScents && (
              <div className="absolute right-2.5 top-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedScentId}
              onValueChange={setSelectedScentId}
              disabled={
                isLoadingScents || !productId || addScentMutation.isPending
              }
              className="flex-grow"
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhóm hương" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectGroup>
                  {scentOptions.length === 0 ? (
                    <SelectItem value="no-options" disabled>
                      {debouncedSearch
                        ? "Không tìm thấy nhóm hương phù hợp"
                        : "Đã gán tất cả nhóm hương có sẵn"}
                    </SelectItem>
                  ) : (
                    scentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="font-medium">{option.label}</span>
                        {option.description && (
                          <span className="text-muted-foreground ml-2 text-xs">
                            ({option.description})
                          </span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              type="button"
              onClick={handleAddScent}
              disabled={
                !selectedScentId || addScentMutation.isPending || !productId
              }
              size="sm"
            >
              {addScentMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              Thêm
            </Button>
          </div>
        </div>

        {/* Scents list */}
        <div className="border rounded-lg bg-muted/30 overflow-hidden">
          <div className="bg-muted/50 px-4 py-2 font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Các nhóm hương đã gán ({productScents.length})</span>
              {isLoadingProductScents && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {productScents.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="end"
                    className="max-w-[300px]"
                  >
                    <p className="text-sm">
                      Di chuột qua để hiển thị nút xóa. Nhấn vào nút xóa để gỡ
                      bỏ nhóm hương khỏi sản phẩm.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {isLoadingProductScents ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : productScents.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="mx-auto rounded-full bg-muted w-12 h-12 flex items-center justify-center mb-3">
                <Tag className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Sản phẩm này chưa được gán nhóm hương nào.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Việc gán nhóm hương sẽ giúp khách hàng dễ dàng tìm thấy sản phẩm
                thông qua bộ lọc.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[250px]">
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {productScents.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between pr-2 group p-2 rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <div className="min-w-0 flex-grow flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-accent/30 hover:bg-accent/40 shrink-0"
                        >
                          {item.scent?.name}
                        </Badge>
                        {item.scent?.description && (
                          <span className="text-sm text-muted-foreground truncate">
                            {item.scent.description}
                          </span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleRemoveScent(item.id, item.scent?.name)
                        }
                        disabled={removeScentMutation.isPending}
                        className="ml-2 shrink-0 h-8 w-8 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">
                          Remove {item.scent?.name}
                        </span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start space-y-2 border-t pt-4">
        <Alert
          variant="info"
          className="bg-blue-50 text-blue-800 border-blue-200"
        >
          <Info className="h-4 w-4" />
          <AlertTitle>Lưu ý về nhóm hương</AlertTitle>
          <AlertDescription>
            Nhóm hương khác với thành phần (ingredients). Nhóm hương mô tả mùi
            tổng thể của sản phẩm (như Floral, Woody, Citrus), trong khi thành
            phần là các note hương cụ thể (như hoa hồng, gỗ đàn hương) được gán
            vào từng tầng hương.
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
}
