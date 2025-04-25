"use client";

import { useState, useEffect } from "react";
import {
  useProductIngredients,
  useUpdateProductIngredients,
} from "../hooks/use-product-ingredients";
import { useIngredients } from "../../ingredients/hooks/use-ingredients";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, X, Loader2, FlaskConical, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "../hooks/use-debounce";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductIngredientsTabProps {
  productId: number | null | undefined;
}

type ScentType = "top" | "middle" | "base";

interface IngredientWithType {
  ingredientId: number;
  scentType: ScentType;
  name?: string; // For display purposes
}

export function ProductIngredientsTab({
  productId,
}: ProductIngredientsTabProps) {
  const toast = useSonnerToast();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ScentType>("top");
  const [selectedIngredients, setSelectedIngredients] = useState<
    IngredientWithType[]
  >([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState<
    number | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  // Fetch product ingredients
  const {
    data: productIngredientsData,
    isLoading: isLoadingProductIngredients,
    isError: isErrorProductIngredients,
  } = useProductIngredients(productId || null);

  // Fetch all ingredients
  const { data: ingredientsData, isLoading: isLoadingIngredients } =
    useIngredients({
      search: debouncedSearch,
    });

  // Update product ingredients mutation
  const { updateIngredients, isPending } = useUpdateProductIngredients();

  // Initialize selected ingredients when data is loaded
  useEffect(() => {
    if (productIngredientsData?.data) {
      const ingredients = productIngredientsData.data.map((item: any) => ({
        ingredientId: item.ingredient_id,
        scentType: item.scent_type as ScentType,
        name: item.ingredients?.name,
      }));
      setSelectedIngredients(ingredients);
      setHasUnsavedChanges(false);
    }
  }, [productIngredientsData]);

  // Handle add ingredient
  const handleAddIngredient = () => {
    if (!selectedIngredientId) return;

    // Check if ingredient already exists in the same scent type
    const exists = selectedIngredients.some(
      (item) =>
        item.ingredientId === selectedIngredientId &&
        item.scentType === activeTab
    );

    if (exists) {
      toast.warning("Thành phần đã tồn tại", {
        description: "Thành phần này đã được thêm vào tầng hương này",
      });
      return;
    }

    // Find ingredient name
    const ingredient = ingredientsData?.data?.find(
      (item: any) => item.id === selectedIngredientId
    );

    // Add ingredient
    setSelectedIngredients((prev) => [
      ...prev,
      {
        ingredientId: selectedIngredientId,
        scentType: activeTab,
        name: ingredient?.name,
      },
    ]);

    // Đánh dấu có thay đổi chưa lưu
    setHasUnsavedChanges(true);

    // Reset selection
    setSelectedIngredientId(null);

    // Hiển thị thông báo xác nhận thêm thành công
    toast.success("Đã thêm thành phần", {
      description: `Đã thêm "${ingredient?.name}" vào ${getScentTypeLabel(
        activeTab
      )}. Nhớ lưu thay đổi!`,
    });
  };

  // Handle remove ingredient
  const handleRemoveIngredient = (
    ingredientId: number,
    scentType: ScentType,
    ingredientName?: string
  ) => {
    setSelectedIngredients((prev) =>
      prev.filter(
        (item) =>
          !(item.ingredientId === ingredientId && item.scentType === scentType)
      )
    );

    // Đánh dấu có thay đổi chưa lưu
    setHasUnsavedChanges(true);

    // Hiển thị thông báo xác nhận xóa thành công
    toast.info("Đã xóa thành phần", {
      description: `Đã xóa ${
        ingredientName || "thành phần"
      } khỏi ${getScentTypeLabel(scentType)}. Nhớ lưu thay đổi!`,
    });
  };

  // Handle save button click
  const handleSave = async () => {
    if (!productId) {
      toast.error("Không tìm thấy ID sản phẩm", {
        description: "ID sản phẩm không hợp lệ",
      });
      return;
    }

    setIsProcessing(true);

    try {
      await updateIngredients({
        productId,
        ingredients: selectedIngredients,
      });
      setHasUnsavedChanges(false);
      toast.success("Lưu thay đổi thành công", {
        description: "Đã cập nhật thành phần sản phẩm",
      });
    } catch (error) {
      toast.error("Cập nhật thất bại", {
        description:
          error instanceof Error ? error.message : "Lỗi không xác định",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Lấy nhãn tiếng Việt cho tầng hương
  const getScentTypeLabel = (type: ScentType): string => {
    switch (type) {
      case "top":
        return "hương đầu";
      case "middle":
        return "hương giữa";
      case "base":
        return "hương cuối";
      default:
        return type;
    }
  };

  // Filter ingredients based on search
  const filteredIngredients = ingredientsData?.data
    ? ingredientsData.data.filter((ingredient: any) =>
        ingredient.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : [];

  // Get ingredients by scent type
  const getIngredientsByType = (type: ScentType) => {
    return selectedIngredients.filter((item) => item.scentType === type);
  };

  if (!productId) {
    return (
      <div className="flex justify-center items-center p-8">
        <p>Vui lòng tạo sản phẩm trước khi quản lý thành phần.</p>
      </div>
    );
  }

  // Check if there are errors loading data
  if (isErrorProductIngredients) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
        <AlertDescription>
          Không thể tải dữ liệu thành phần. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FlaskConical className="h-5 w-5" /> Quản lý thành phần sản phẩm
        </CardTitle>
        <CardDescription>
          Thêm các thành phần vào từng tầng hương (top, middle, base) của sản
          phẩm để giúp khách hàng hiểu rõ hơn về hồ sơ mùi hương.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Ingredient Selector */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative col-span-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm thành phần..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {isLoadingIngredients && (
                <div className="absolute right-2.5 top-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={selectedIngredientId?.toString() || ""}
                onValueChange={(value) =>
                  setSelectedIngredientId(value ? Number.parseInt(value) : null)
                }
                disabled={isLoadingIngredients}
                className="flex-grow"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thành phần" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {debouncedSearch && filteredIngredients.length === 0 ? (
                    <div className="py-2 px-2 text-sm text-muted-foreground">
                      Không tìm thấy thành phần nào
                    </div>
                  ) : (
                    filteredIngredients.map((ingredient: any) => (
                      <SelectItem
                        key={ingredient.id}
                        value={ingredient.id.toString()}
                      >
                        <span className="font-medium">{ingredient.name}</span>
                        {ingredient.description && (
                          <span className="text-muted-foreground ml-2 text-xs">
                            ({ingredient.description})
                          </span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <Button
                onClick={handleAddIngredient}
                disabled={!selectedIngredientId || isProcessing}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm
              </Button>
            </div>
          </div>
        </div>

        {/* Scent Type Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ScentType)}
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="top" className="relative">
              <div className="flex items-center justify-center gap-2">
                Hương đầu
                <Badge variant="secondary" className="ml-1">
                  {getIngredientsByType("top").length}
                </Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="middle" className="relative">
              <div className="flex items-center justify-center gap-2">
                Hương giữa
                <Badge variant="secondary" className="ml-1">
                  {getIngredientsByType("middle").length}
                </Badge>
              </div>
            </TabsTrigger>
            <TabsTrigger value="base" className="relative">
              <div className="flex items-center justify-center gap-2">
                Hương cuối
                <Badge variant="secondary" className="ml-1">
                  {getIngredientsByType("base").length}
                </Badge>
              </div>
            </TabsTrigger>
          </TabsList>

          {["top", "middle", "base"].map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <Card className="border">
                <CardHeader className="py-3">
                  <CardTitle className="text-base">
                    {type === "top"
                      ? "Hương đầu (Top Notes)"
                      : type === "middle"
                      ? "Hương giữa (Middle Notes)"
                      : "Hương cuối (Base Notes)"}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {type === "top"
                      ? "Hương đầu là những mùi hương bạn ngửi thấy đầu tiên, thường bay hơi nhanh trong vòng 15-30 phút."
                      : type === "middle"
                      ? "Hương giữa xuất hiện sau khi hương đầu bay hơi, thường kéo dài từ 2-4 giờ."
                      : "Hương cuối là nền tảng của nước hoa, xuất hiện sau cùng và có thể kéo dài từ 5-10 giờ hoặc lâu hơn."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 pb-4">
                  {isLoadingProductIngredients ? (
                    <div className="flex justify-center items-center h-20">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : getIngredientsByType(type as ScentType).length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground border border-dashed rounded-md">
                      <p>
                        Chưa có thành phần nào trong{" "}
                        {type === "top"
                          ? "hương đầu"
                          : type === "middle"
                          ? "hương giữa"
                          : "hương cuối"}
                        .
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {getIngredientsByType(type as ScentType).map((item) => (
                        <TooltipProvider
                          key={`${item.ingredientId}-${item.scentType}`}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="secondary"
                                className="flex items-center gap-1 px-3 py-1.5 bg-accent/30 hover:bg-accent/40 cursor-default"
                              >
                                {item.name}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 ml-1 text-muted-foreground hover:text-destructive hover:bg-background/60"
                                  onClick={() =>
                                    handleRemoveIngredient(
                                      item.ingredientId,
                                      item.scentType,
                                      item.name
                                    )
                                  }
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Nhấn vào nút X để xóa thành phần này</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        {hasUnsavedChanges && (
          <Alert
            variant="info"
            className="flex-grow bg-blue-50 text-blue-800 border-blue-200"
          >
            <Info className="h-4 w-4" />
            <AlertTitle>Thay đổi chưa được lưu</AlertTitle>
            <AlertDescription>
              Bạn đã thay đổi danh sách thành phần. Đừng quên nhấn "Lưu thay
              đổi" để cập nhật.
            </AlertDescription>
          </Alert>
        )}
        {!hasUnsavedChanges && <div />}

        <Button
          onClick={handleSave}
          disabled={isProcessing || !hasUnsavedChanges}
          className={`${!hasUnsavedChanges ? "" : "animate-pulse"}`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            "Lưu thay đổi"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
