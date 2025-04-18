"use client";

import { useState, useEffect } from "react";
import {
  useProductCategories,
  useUpdateProductCategories,
} from "../hooks/use-product-categories";
import { useCategories } from "../../categories/hooks/use-categories";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDebounce } from "../hooks/use-debounce";

interface ProductCategoriesTabProps {
  productId: number | null | undefined;
}

export function ProductCategoriesTab({ productId }: ProductCategoriesTabProps) {
  const toast = useSonnerToast();
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  // Fetch product categories
  const { data: productCategoriesData, isLoading: isLoadingProductCategories } =
    useProductCategories(productId || null);

  // Fetch all categories
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCategories();

  // Update product categories mutation
  const { updateCategories } = useUpdateProductCategories();

  // Initialize selected categories when data is loaded
  useEffect(() => {
    if (productCategoriesData?.data) {
      const categoryIds = productCategoriesData.data.map(
        (item: any) => item.category_id
      );
      setSelectedCategories(categoryIds);
    }
  }, [productCategoriesData]);

  // Handle category selection
  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, categoryId]);
    } else {
      setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
    }
  };

  // Handle save button click
  const handleSave = async () => {
    if (!productId) {
      toast.error("Không tìm thấy ID sản phẩm");
      return;
    }

    setIsProcessing(true);

    try {
      await updateCategories(productId, selectedCategories);
      toast.success("Danh mục sản phẩm đã được cập nhật thành công");
    } catch (error) {
      toast.error(
        `Lỗi khi cập nhật danh mục: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter categories based on search
  const filteredCategories = categoriesData?.data
    ? categoriesData.data.filter((category: any) =>
        category.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : [];

  if (!productId) {
    return (
      <div className="flex justify-center items-center p-8">
        <p>Vui lòng tạo sản phẩm trước khi quản lý danh mục.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý danh mục</CardTitle>
        <CardDescription>
          Chọn các danh mục cho sản phẩm này. Sản phẩm có thể thuộc nhiều danh
          mục.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm danh mục..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories List */}
        {isLoadingCategories || isLoadingProductCategories ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Không tìm thấy danh mục nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-1">
            {filteredCategories.map((category: any) => (
              <div
                key={category.id}
                className="flex items-center space-x-2 border rounded-md p-3"
              >
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) =>
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="flex-1 cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave} disabled={isProcessing}>
          {isProcessing ? "Đang xử lý..." : "Lưu thay đổi"}
        </Button>
      </CardFooter>
    </Card>
  );
}
