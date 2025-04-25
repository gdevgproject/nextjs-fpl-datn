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
import { AlertCircle, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ProductScentsTabProps {
  productId: number | null | undefined;
}

export function ProductScentsTab({ productId }: ProductScentsTabProps) {
  const [selectedScentId, setSelectedScentId] = useState<string>("");

  // Get all available scents for dropdown
  const {
    data: scentsData,
    isLoading: isLoadingScents,
    isError: isErrorScents,
  } = useScents();

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
  const handleRemoveScent = async (id: number) => {
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
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load scent data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Get the list of available scents for dropdown
  const availableScents = scentsData?.data || [];

  // Get the list of scents assigned to this product
  const productScents = productScentsData?.data || [];

  // Generate scent options for select dropdown
  const scentOptions = availableScents.map((scent) => ({
    value: scent.id.toString(),
    label: scent.name,
    description: scent.description,
  }));

  return (
    <div className="space-y-4 py-2">
      <h3 className="text-lg font-medium">Nhóm hương của sản phẩm</h3>
      <p className="text-sm text-muted-foreground">
        Quản lý các nhóm mùi hương tổng thể cho sản phẩm này. Gán nhiều nhóm
        hương giúp khách hàng dễ dàng tìm thấy sản phẩm thông qua bộ lọc.
      </p>

      {/* Add new scent section */}
      <div className="flex items-end gap-2 mt-4">
        <div className="flex-1">
          <Select
            value={selectedScentId}
            onValueChange={setSelectedScentId}
            disabled={
              isLoadingScents || !productId || addScentMutation.isPending
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn nhóm hương" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {isLoadingScents ? (
                  <SelectItem value="loading" disabled>
                    Đang tải...
                  </SelectItem>
                ) : (
                  scentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}{" "}
                      {option.description && `(${option.description})`}
                    </SelectItem>
                  ))
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          onClick={handleAddScent}
          disabled={
            !selectedScentId || addScentMutation.isPending || !productId
          }
        >
          {addScentMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          Thêm nhóm hương
        </Button>
      </div>

      {/* Scents list */}
      <div className="mt-6 border rounded-md">
        <h4 className="px-4 py-2 border-b font-medium">
          Các nhóm hương đã gán
        </h4>

        {isLoadingProductScents ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : productScents.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 text-center">
            Sản phẩm này chưa được gán nhóm hương nào.
          </p>
        ) : (
          <ScrollArea className="h-[250px]">
            <div className="p-4 space-y-3">
              {productScents.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.scent.name}</Badge>
                    {item.scent.description && (
                      <span className="text-sm text-muted-foreground">
                        {item.scent.description}
                      </span>
                    )}
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveScent(item.id)}
                    disabled={removeScentMutation.isPending}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      <div className="space-y-2 mt-6">
        <Separator />
        <p className="text-sm text-muted-foreground italic">
          <strong>Lưu ý:</strong> Nhóm hương khác với thành phần (ingredients).
          Nhóm hương mô tả mùi tổng thể của sản phẩm (như Floral, Woody,
          Citrus), trong khi thành phần là các note hương cụ thể (như hoa hồng,
          gỗ đàn hương) được gán vào từng tầng hương.
        </p>
      </div>
    </div>
  );
}
