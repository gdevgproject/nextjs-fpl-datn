"use client";

import type React from "react";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Giá trị mặc định cho khoảng giá
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 10000000;

interface FilterSidebarProps {
    filterOptions: {
        brands: { id: number; name: string }[];
        categories: {
            id: number;
            name: string;
            slug: string;
            parent_category_id: number | null;
        }[];
        genders: { id: number; name: string }[];
        perfumeTypes: { id: number; name: string }[];
        concentrations: { id: number; name: string }[];
        priceRanges: { min: number; max: number | null; label: string }[];
    };
    currentFilters: { [key: string]: string | string[] | undefined };
}

export function FilterSidebar({ filterOptions, currentFilters }: FilterSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Add useTransition hook for smoother navigation
    const [isPending, startTransition] = useTransition();

    // State cho mobile filter sheet
    const [isOpen, setIsOpen] = useState(false);

    // State for error handling
    const [error, setError] = useState<string | null>(null);

    // Parse initial price values safely
    const parseInitialPrice = useCallback((value: string | undefined, defaultValue: number): number => {
        if (!value) return defaultValue;
        const parsed = Number.parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }, []);

    // State cho khoảng giá
    const [priceRange, setPriceRange] = useState<[number, number]>([
        parseInitialPrice(currentFilters.minPrice as string, DEFAULT_MIN_PRICE),
        parseInitialPrice(currentFilters.maxPrice as string, DEFAULT_MAX_PRICE),
    ]);

    // State cho giá hiển thị (để tránh re-render liên tục khi kéo slider)
    const [displayPriceRange, setDisplayPriceRange] = useState<[number, number]>(priceRange);

    // State cho tìm kiếm trong các bộ lọc
    const [brandSearch, setBrandSearch] = useState("");
    const [categorySearch, setCategorySearch] = useState("");

    // State cục bộ để lưu trữ các bộ lọc đã chọn
    const [localFilters, setLocalFilters] = useState<{
        [key: string]: string | string[];
    }>({
        brand: currentFilters.brand || "",
        category: currentFilters.category || "",
        gender: currentFilters.gender || "",
        perfume_type: currentFilters.perfume_type || "",
        concentration: currentFilters.concentration || "",
        minPrice: currentFilters.minPrice || "",
        maxPrice: currentFilters.maxPrice || "",
        featured: currentFilters.featured === "true" ? "true" : "",
        sale: currentFilters.sale === "true" ? "true" : "",
    });

    // State để đánh dấu khi nào cần redirect
    const [needsRedirect, setNeedsRedirect] = useState<boolean>(false);

    // Cập nhật localFilters khi currentFilters thay đổi từ URL
    useEffect(() => {
        setLocalFilters({
            brand: currentFilters.brand || "",
            category: currentFilters.category || "",
            gender: currentFilters.gender || "",
            perfume_type: currentFilters.perfume_type || "",
            concentration: currentFilters.concentration || "",
            minPrice: currentFilters.minPrice || "",
            maxPrice: currentFilters.maxPrice || "",
            featured: currentFilters.featured === "true" ? "true" : "",
            sale: currentFilters.sale === "true" ? "true" : "",
        });
    }, [currentFilters]);

    // Cập nhật displayPriceRange và priceRange khi currentFilters thay đổi từ URL
    useEffect(() => {
        const minPrice = parseInitialPrice(currentFilters.minPrice as string, DEFAULT_MIN_PRICE);
        const maxPrice = parseInitialPrice(currentFilters.maxPrice as string, DEFAULT_MAX_PRICE);

        // Đảm bảo min <= max
        const validatedMinPrice = Math.min(minPrice, maxPrice);
        const validatedMaxPrice = Math.max(minPrice, maxPrice);

        setPriceRange([validatedMinPrice, validatedMaxPrice]);
        setDisplayPriceRange([validatedMinPrice, validatedMaxPrice]);

        // Cập nhật localFilters để đồng bộ với URL
        setLocalFilters((prev) => ({
            ...prev,
            minPrice: validatedMinPrice !== DEFAULT_MIN_PRICE ? validatedMinPrice.toString() : "",
            maxPrice: validatedMaxPrice !== DEFAULT_MAX_PRICE ? validatedMaxPrice.toString() : "",
        }));
    }, [currentFilters.minPrice, currentFilters.maxPrice, parseInitialPrice]);

    // UseEffect để xử lý redirect khi cần thiết
    useEffect(() => {
        if (needsRedirect) {
            try {
                // Xây dựng URL từ bộ lọc hiện tại
                const params = new URLSearchParams();

                // Thêm các tham số từ localFilters
                for (const key in localFilters) {
                    if (localFilters[key]) {
                        // Chỉ thêm các giá trị không rỗng
                        params.set(key, String(localFilters[key])); // Đảm bảo chuyển đổi sang String
                    }
                }

                // Giữ lại tham số tìm kiếm nếu có
                if (searchParams && searchParams.has("q")) {
                    const searchQuery = searchParams.get("q");
                    if (searchQuery) {
                        params.set("q", searchQuery);
                    }
                }

                // Giữ lại tham số sắp xếp nếu có
                if (searchParams && searchParams.has("sort")) {
                    const sortValue = searchParams.get("sort");
                    if (sortValue) {
                        params.set("sort", sortValue);
                    }
                }

                // Reset page number to 1 when removing filters
                params.delete("page");

                // Tạo URL mới với phần parameters
                const newUrl = pathname + (params.toString() ? `?${params.toString()}` : "");

                // Điều hướng đến URL mới
                startTransition(() => {
                    router.replace(newUrl);
                    setIsOpen(false);
                });
            } catch (error) {
                console.error("Error during redirect:", error);
            }

            // Reset flag
            setNeedsRedirect(false);
        }
    }, [needsRedirect, localFilters, pathname, router, searchParams, setIsOpen]);

    // Tính toán số lượng bộ lọc đang áp dụng
    const getActiveFilterCount = () => {
        let count = 0;

        if (localFilters.brand) count++;
        if (localFilters.category) count++;
        if (localFilters.gender) count++;
        if (localFilters.perfume_type) count++;
        if (localFilters.concentration) count++;
        if (localFilters.minPrice || localFilters.maxPrice) count++;
        if (localFilters.featured === "true") count++;
        if (localFilters.sale === "true") count++;

        return count;
    };

    // Lọc danh sách thương hiệu theo từ khóa tìm kiếm
    const filteredBrands = filterOptions.brands.filter((brand) => brand.name.toLowerCase().includes(brandSearch.toLowerCase()));

    // Lọc danh sách danh mục theo từ khóa tìm kiếm
    const filteredCategories = filterOptions.categories.filter((category) => category.name.toLowerCase().includes(categorySearch.toLowerCase()));

    // Xử lý khi thay đổi bộ lọc (trong local state)
    const handleLocalFilterChange = (key: string, value: string) => {
        setError(null); // Clear any previous errors when changing filters

        setLocalFilters((prev) => {
            // If the value is the same as the current value and not empty, toggle it off (uncheck)
            if (prev[key] === value && value !== "") {
                return {
                    ...prev,
                    [key]: "",
                };
            }

            // Otherwise set the new value
            return {
                ...prev,
                [key]: value,
            };
        });

        // If we're changing something other than price, reset any price errors
        if (key !== "minPrice" && key !== "maxPrice") {
            setError(null);
        }
    };

    // Áp dụng các bộ lọc (tạo URL và điều hướng)
    const applyFilters = () => {
        // Reset any previous errors
        setError(null);

        try {
            // Validate price ranges before applying
            if (localFilters.minPrice && localFilters.maxPrice) {
                const minPrice = Number.parseInt(localFilters.minPrice as string, 10);
                const maxPrice = Number.parseInt(localFilters.maxPrice as string, 10);

                if (minPrice > maxPrice) {
                    setError("Giá tối thiểu không thể lớn hơn giá tối đa");
                    return;
                }
            }

            const params = new URLSearchParams();

            // Thêm các tham số từ localFilters
            for (const key in localFilters) {
                if (localFilters[key]) {
                    // Chỉ thêm các giá trị không rỗng
                    params.set(key, localFilters[key] as string);
                }
            }

            // Giữ lại tham số tìm kiếm nếu có
            if (searchParams.has("q")) {
                params.set("q", searchParams.get("q")!);
            }

            // Giữ lại tham số sắp xếp nếu có
            if (searchParams.has("sort")) {
                params.set("sort", searchParams.get("sort")!);
            }

            // Reset page number to 1 when applying new filters
            params.delete("page");

            // Use startTransition to avoid blocking the UI during navigation
            startTransition(() => {
                // Điều hướng đến URL mới với REPLACE để không thêm vào history stack quá nhiều
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                // Đóng sheet trên mobile
                setIsOpen(false);
            });
        } catch (error) {
            console.error("Error applying filters:", error);
            setError("Có lỗi xảy ra khi áp dụng bộ lọc. Vui lòng thử lại.");
        }
    };

    // Xử lý khi thay đổi khoảng giá từ slider
    const handlePriceChange = (values: number[]) => {
        // Update the display price range immediately to reflect slider movement
        setDisplayPriceRange([values[0], values[1]]);
    };

    // Xử lý khi kết thúc thay đổi khoảng giá từ slider
    const handlePriceChangeEnd = (values: number[]) => {
        // Validate that min <= max (shouldn't be needed with slider but for safety)
        const validMin = Math.min(values[0], values[1]);
        const validMax = Math.max(values[0], values[1]);

        setPriceRange([validMin, validMax]);
        setDisplayPriceRange([validMin, validMax]);

        setLocalFilters((prev) => ({
            ...prev,
            minPrice: validMin !== DEFAULT_MIN_PRICE ? validMin.toString() : "",
            maxPrice: validMax !== DEFAULT_MAX_PRICE ? validMax.toString() : "",
        }));

        // Clear any previous error
        setError(null);
    };

    // Xử lý khi thay đổi giá trực tiếp qua input
    const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.trim();

        if (inputValue === "") {
            setDisplayPriceRange([DEFAULT_MIN_PRICE, displayPriceRange[1]]);
            return;
        }

        const value = Number.parseInt(inputValue, 10);

        if (isNaN(value)) return;

        // Ensure min price is not negative and not greater than max price
        const validValue = Math.min(Math.max(0, value), displayPriceRange[1]);
        setDisplayPriceRange([validValue, displayPriceRange[1]]);
    };

    const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.trim();

        if (inputValue === "") {
            setDisplayPriceRange([displayPriceRange[0], DEFAULT_MAX_PRICE]);
            return;
        }

        const value = Number.parseInt(inputValue, 10);

        if (isNaN(value)) return;

        // Ensure max price is not above the maximum allowed and not less than min price
        const validValue = Math.max(Math.min(DEFAULT_MAX_PRICE, value), displayPriceRange[0]);
        setDisplayPriceRange([displayPriceRange[0], validValue]);
    };

    // Apply price range changes when input fields lose focus
    const handlePriceInputBlur = () => {
        // Ensure min <= max
        const validMin = Math.min(displayPriceRange[0], displayPriceRange[1]);
        const validMax = Math.max(displayPriceRange[0], displayPriceRange[1]);

        const newPriceRange: [number, number] = [validMin, validMax];

        setDisplayPriceRange(newPriceRange);
        setPriceRange(newPriceRange);

        setLocalFilters((prev) => ({
            ...prev,
            minPrice: validMin !== DEFAULT_MIN_PRICE ? validMin.toString() : "",
            maxPrice: validMax !== DEFAULT_MAX_PRICE ? validMax.toString() : "",
        }));

        // Clear any previous error related to price validation
        setError(null);
    };

    // Xóa tất cả bộ lọc
    const clearAllFilters = () => {
        setLocalFilters({
            brand: "",
            category: "",
            gender: "",
            perfume_type: "",
            concentration: "",
            minPrice: "",
            maxPrice: "",
            featured: "",
            sale: "",
        });

        // Reset price range
        setPriceRange([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);
        setDisplayPriceRange([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);

        // Đánh dấu để áp dụng sau khi render
        setNeedsRedirect(true);
    };

    // Xóa một bộ lọc cụ thể
    const removeFilter = (key: string) => {
        setError(null); // Clear any errors when removing filters

        setLocalFilters((prev) => {
            const newFilters = { ...prev };

            // Special handling for price filters
            if (key === "price") {
                newFilters.minPrice = "";
                newFilters.maxPrice = "";
                setPriceRange([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);
                setDisplayPriceRange([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);
            } else {
                newFilters[key] = "";
            }

            // Đánh dấu để áp dụng sau khi render
            setNeedsRedirect(true);

            return newFilters;
        });
    };

    // Kiểm tra xem một khoảng giá có đang được chọn không
    const isPriceRangeSelected = (min: number, max: number | null): boolean => {
        // Đảm bảo an toàn khi chuyển đổi thành số
        const currentMin = Number.parseInt(String(localFilters.minPrice || ""), 10) || DEFAULT_MIN_PRICE;
        const currentMax = Number.parseInt(String(localFilters.maxPrice || ""), 10) || DEFAULT_MAX_PRICE;

        return currentMin === min && currentMax === (max !== null ? max : DEFAULT_MAX_PRICE);
    };

    // Hiển thị các bộ lọc đang áp dụng
    const renderActiveFilters = () => {
        const activeFilters = [];

        // Thương hiệu
        if (localFilters.brand) {
            const brand = filterOptions.brands.find((b) => b.id.toString() === localFilters.brand);
            if (brand) {
                activeFilters.push(
                    <Badge key="brand" variant="secondary" className="flex items-center gap-1">
                        {brand.name}
                        <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => removeFilter("brand")}>
                            <X className="h-3 w-3" />
                            <span className="sr-only">Xóa bộ lọc thương hiệu</span>
                        </Button>
                    </Badge>
                );
            }
        }

        // Danh mục
        if (localFilters.category) {
            const category = filterOptions.categories.find((c) => c.slug === localFilters.category);
            if (category) {
                activeFilters.push(
                    <Badge key="category" variant="secondary" className="flex items-center gap-1">
                        {category.name}
                        <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => removeFilter("category")}>
                            <X className="h-3 w-3" />
                            <span className="sr-only">Xóa bộ lọc danh mục</span>
                        </Button>
                    </Badge>
                );
            }
        }

        // Giới tính
        if (localFilters.gender) {
            const gender = filterOptions.genders.find((g) => g.id.toString() === localFilters.gender);
            if (gender) {
                activeFilters.push(
                    <Badge key="gender" variant="secondary" className="flex items-center gap-1">
                        {gender.name}
                        <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => removeFilter("gender")}>
                            <X className="h-3 w-3" />
                            <span className="sr-only">Xóa bộ lọc giới tính</span>
                        </Button>
                    </Badge>
                );
            }
        }

        // Loại nước hoa
        if (localFilters.perfume_type) {
            const type = filterOptions.perfumeTypes.find((t) => t.id.toString() === localFilters.perfume_type);
            if (type) {
                activeFilters.push(
                    <Badge key="perfume_type" variant="secondary" className="flex items-center gap-1">
                        {type.name}
                        <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => removeFilter("perfume_type")}>
                            <X className="h-3 w-3" />
                            <span className="sr-only">Xóa bộ lọc loại nước hoa</span>
                        </Button>
                    </Badge>
                );
            }
        }

        // Nồng độ
        if (localFilters.concentration) {
            const concentration = filterOptions.concentrations.find((c) => c.id.toString() === localFilters.concentration);
            if (concentration) {
                activeFilters.push(
                    <Badge key="concentration" variant="secondary" className="flex items-center gap-1">
                        {concentration.name}
                        <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => removeFilter("concentration")}>
                            <X className="h-3 w-3" />
                            <span className="sr-only">Xóa bộ lọc nồng độ</span>
                        </Button>
                    </Badge>
                );
            }
        }

        // Khoảng giá
        if (localFilters.minPrice || localFilters.maxPrice) {
            activeFilters.push(
                <Badge key="price" variant="secondary" className="flex items-center gap-1">
                    {formatPrice(Number.parseInt(localFilters.minPrice as string, 10) || DEFAULT_MIN_PRICE)} -{" "}
                    {formatPrice(Number.parseInt(localFilters.maxPrice as string, 10) || DEFAULT_MAX_PRICE)}
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => removeFilter("price")}>
                        <X className="h-3 w-3" />
                        <span className="sr-only">Xóa bộ lọc giá</span>
                    </Button>
                </Badge>
            );
        }

        // Sản phẩm nổi bật
        if (localFilters.featured === "true") {
            activeFilters.push(
                <Badge key="featured" variant="secondary" className="flex items-center gap-1">
                    Nổi bật
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => removeFilter("featured")}>
                        <X className="h-3 w-3" />
                        <span className="sr-only">Xóa bộ lọc nổi bật</span>
                    </Button>
                </Badge>
            );
        }

        // Sản phẩm giảm giá
        if (localFilters.sale === "true") {
            activeFilters.push(
                <Badge key="sale" variant="secondary" className="flex items-center gap-1">
                    Giảm giá
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0" onClick={() => removeFilter("sale")}>
                        <X className="h-3 w-3" />
                        <span className="sr-only">Xóa bộ lọc giảm giá</span>
                    </Button>
                </Badge>
            );
        }

        return activeFilters;
    };

    // Nội dung bộ lọc
    const filterContent = (
        <div className="space-y-6">
            {/* Show error alert if there's an error */}
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Hiển thị các bộ lọc đang áp dụng */}
            {getActiveFilterCount() > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium">Bộ lọc đang áp dụng ({getActiveFilterCount()})</h3>
                        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 px-2 text-xs">
                            Xóa tất cả
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">{renderActiveFilters()}</div>
                </div>
            )}

            <Accordion type="multiple" defaultValue={["category", "brand", "gender", "price"]}>
                {/* Bộ lọc danh mục */}
                <AccordionItem value="category" className="border-b">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">
                        <span className="font-medium">Danh mục</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="mb-2">
                            <Input
                                placeholder="Tìm danh mục..."
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="max-h-48 space-y-1 overflow-y-auto pr-2">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((category) => (
                                    <div key={category.id} className="flex items-center space-x-2">
                                        <div className="flex h-4 w-4 items-center justify-center rounded-sm border">
                                            <Checkbox
                                                id={`category-${category.id}`}
                                                checked={localFilters.category === category.slug}
                                                onCheckedChange={(checked) => handleLocalFilterChange("category", checked ? category.slug : "")}
                                                className="h-3 w-3 rounded-sm"
                                            />
                                        </div>
                                        <label
                                            htmlFor={`category-${category.id}`}
                                            className={cn(
                                                "flex-1 cursor-pointer text-sm",
                                                localFilters.category === category.slug ? "font-medium text-primary" : ""
                                            )}
                                        >
                                            {category.name}
                                        </label>
                                        {localFilters.category === category.slug && <Check className="h-3 w-3 text-primary" />}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground">Không tìm thấy danh mục</p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Bộ lọc thương hiệu */}
                <AccordionItem value="brand" className="border-b">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">
                        <span className="font-medium">Thương hiệu</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="mb-2">
                            <Input
                                placeholder="Tìm thương hiệu..."
                                value={brandSearch}
                                onChange={(e) => setBrandSearch(e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="max-h-48 space-y-1 overflow-y-auto pr-2">
                            {filteredBrands.length > 0 ? (
                                filteredBrands.map((brand) => (
                                    <div key={brand.id} className="flex items-center space-x-2">
                                        <div className="flex h-4 w-4 items-center justify-center rounded-sm border">
                                            <Checkbox
                                                id={`brand-${brand.id}`}
                                                checked={localFilters.brand === brand.id.toString()}
                                                onCheckedChange={(checked) => handleLocalFilterChange("brand", checked ? brand.id.toString() : "")}
                                                className="h-3 w-3 rounded-sm"
                                            />
                                        </div>
                                        <label
                                            htmlFor={`brand-${brand.id}`}
                                            className={cn(
                                                "flex-1 cursor-pointer text-sm",
                                                localFilters.brand === brand.id.toString() ? "font-medium text-primary" : ""
                                            )}
                                        >
                                            {brand.name}
                                        </label>
                                        {localFilters.brand === brand.id.toString() && <Check className="h-3 w-3 text-primary" />}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground">Không tìm thấy thương hiệu</p>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Bộ lọc giới tính */}
                <AccordionItem value="gender" className="border-b">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">
                        <span className="font-medium">Giới tính</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-1">
                            {filterOptions.genders.map((gender) => (
                                <div key={gender.id} className="flex items-center space-x-2">
                                    <div className="flex h-4 w-4 items-center justify-center rounded-sm border">
                                        <Checkbox
                                            id={`gender-${gender.id}`}
                                            checked={localFilters.gender === gender.id.toString()}
                                            onCheckedChange={(checked) => handleLocalFilterChange("gender", checked ? gender.id.toString() : "")}
                                            className="h-3 w-3 rounded-sm"
                                        />
                                    </div>
                                    <label
                                        htmlFor={`gender-${gender.id}`}
                                        className={cn(
                                            "flex-1 cursor-pointer text-sm",
                                            localFilters.gender === gender.id.toString() ? "font-medium text-primary" : ""
                                        )}
                                    >
                                        {gender.name}
                                    </label>
                                    {localFilters.gender === gender.id.toString() && <Check className="h-3 w-3 text-primary" />}
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Bộ lọc loại nước hoa */}
                <AccordionItem value="perfume_type" className="border-b">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">
                        <span className="font-medium">Loại nước hoa</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-1">
                            {filterOptions.perfumeTypes.map((type) => (
                                <div key={type.id} className="flex items-center space-x-2">
                                    <div className="flex h-4 w-4 items-center justify-center rounded-sm border">
                                        <Checkbox
                                            id={`type-${type.id}`}
                                            checked={localFilters.perfume_type === type.id.toString()}
                                            onCheckedChange={(checked) => handleLocalFilterChange("perfume_type", checked ? type.id.toString() : "")}
                                            className="h-3 w-3 rounded-sm"
                                        />
                                    </div>
                                    <label
                                        htmlFor={`type-${type.id}`}
                                        className={cn(
                                            "flex-1 cursor-pointer text-sm",
                                            localFilters.perfume_type === type.id.toString() ? "font-medium text-primary" : ""
                                        )}
                                    >
                                        {type.name}
                                    </label>
                                    {localFilters.perfume_type === type.id.toString() && <Check className="h-3 w-3 text-primary" />}
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Bộ lọc nồng độ */}
                <AccordionItem value="concentration" className="border-b">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">
                        <span className="font-medium">Nồng độ</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-1">
                            {filterOptions.concentrations.map((concentration) => (
                                <div key={concentration.id} className="flex items-center space-x-2">
                                    <div className="flex h-4 w-4 items-center justify-center rounded-sm border">
                                        <Checkbox
                                            id={`concentration-${concentration.id}`}
                                            checked={localFilters.concentration === concentration.id.toString()}
                                            onCheckedChange={(checked) => handleLocalFilterChange("concentration", checked ? concentration.id.toString() : "")}
                                            className="h-3 w-3 rounded-sm"
                                        />
                                    </div>
                                    <label
                                        htmlFor={`concentration-${concentration.id}`}
                                        className={cn(
                                            "flex-1 cursor-pointer text-sm",
                                            localFilters.concentration === concentration.id.toString() ? "font-medium text-primary" : ""
                                        )}
                                    >
                                        {concentration.name}
                                    </label>
                                    {localFilters.concentration === concentration.id.toString() && <Check className="h-3 w-3 text-primary" />}
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Bộ lọc giá */}
                <AccordionItem value="price" className="border-b">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">
                        <span className="font-medium">Giá</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4">
                            {/* Các khoảng giá được định nghĩa sẵn */}
                            <div className="space-y-1">
                                {filterOptions.priceRanges.map((range, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <div className="flex h-4 w-4 items-center justify-center rounded-sm border">
                                            <Checkbox
                                                id={`price-range-${index}`}
                                                checked={isPriceRangeSelected(range.min, range.max)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        const minPrice = range.min.toString();
                                                        // Handle case when max is null (for "Above X" price ranges)
                                                        const maxPrice = range.max !== null ? range.max.toString() : "";

                                                        setLocalFilters((prev) => ({
                                                            ...prev,
                                                            minPrice,
                                                            maxPrice,
                                                        }));

                                                        // Set the UI range values
                                                        const minValue = range.min;
                                                        const maxValue = range.max !== null ? range.max : DEFAULT_MAX_PRICE;
                                                        setPriceRange([minValue, maxValue]);
                                                        setDisplayPriceRange([minValue, maxValue]);
                                                    } else {
                                                        setLocalFilters((prev) => ({
                                                            ...prev,
                                                            minPrice: "",
                                                            maxPrice: "",
                                                        }));
                                                        setPriceRange([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);
                                                        setDisplayPriceRange([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);
                                                    }
                                                }}
                                                className="h-3 w-3 rounded-sm"
                                            />
                                        </div>
                                        <label
                                            htmlFor={`price-range-${index}`}
                                            className={cn(
                                                "flex-1 cursor-pointer text-sm",
                                                isPriceRangeSelected(range.min, range.max) ? "font-medium text-primary" : ""
                                            )}
                                        >
                                            {range.label}
                                        </label>
                                        {isPriceRangeSelected(range.min, range.max) && <Check className="h-3 w-3 text-primary" />}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-2">
                                <h4 className="mb-2 text-xs font-medium text-muted-foreground">Hoặc chọn khoảng giá tùy chỉnh:</h4>
                                <Slider
                                    value={displayPriceRange}
                                    min={DEFAULT_MIN_PRICE}
                                    max={DEFAULT_MAX_PRICE}
                                    step={100000}
                                    minStepsBetweenThumbs={1}
                                    onValueChange={handlePriceChange}
                                    onValueCommit={handlePriceChangeEnd}
                                    className="py-4"
                                />
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex-1">
                                    <label htmlFor="min-price" className="mb-1 block text-xs text-muted-foreground">
                                        Giá tối thiểu
                                    </label>
                                    <Input
                                        id="min-price"
                                        type="number"
                                        min={DEFAULT_MIN_PRICE}
                                        max={displayPriceRange[1]}
                                        value={displayPriceRange[0]}
                                        onChange={handleMinPriceChange}
                                        onBlur={handlePriceInputBlur}
                                        className="h-8 text-sm"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="max-price" className="mb-1 block text-xs text-muted-foreground">
                                        Giá tối đa
                                    </label>
                                    <Input
                                        id="max-price"
                                        type="number"
                                        min={displayPriceRange[0]}
                                        max={DEFAULT_MAX_PRICE}
                                        value={displayPriceRange[1]}
                                        onChange={handleMaxPriceChange}
                                        onBlur={handlePriceInputBlur}
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{formatPrice(displayPriceRange[0])}</span>
                                <span>{formatPrice(displayPriceRange[1])}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Bộ lọc khác */}
                {/* <AccordionItem value="other" className="border-b">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">
                        <span className="font-medium">Khác</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                                <div className="flex h-4 w-4 items-center justify-center rounded-sm border">
                                    <Checkbox
                                        id="featured"
                                        checked={localFilters.featured === "true"}
                                        onCheckedChange={(checked) => handleLocalFilterChange("featured", checked ? "true" : "")}
                                        className="h-3 w-3 rounded-sm"
                                    />
                                </div>
                                <label
                                    htmlFor="featured"
                                    className={cn("flex-1 cursor-pointer text-sm", localFilters.featured === "true" ? "font-medium text-primary" : "")}
                                >
                                    Sản phẩm nổi bật
                                </label>
                                {localFilters.featured === "true" && <Check className="h-3 w-3 text-primary" />}
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="flex h-4 w-4 items-center justify-center rounded-sm border">
                                    <Checkbox
                                        id="sale"
                                        checked={localFilters.sale === "true"}
                                        onCheckedChange={(checked) => handleLocalFilterChange("sale", checked ? "true" : "")}
                                        className="h-3 w-3 rounded-sm"
                                    />
                                </div>
                                <label
                                    htmlFor="sale"
                                    className={cn("flex-1 cursor-pointer text-sm", localFilters.sale === "true" ? "font-medium text-primary" : "")}
                                >
                                    Đang giảm giá
                                </label>
                                {localFilters.sale === "true" && <Check className="h-3 w-3 text-primary" />}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem> */}
            </Accordion>

            <Button onClick={applyFilters} className="w-full" disabled={isPending}>
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang áp dụng...
                    </>
                ) : (
                    "Áp dụng bộ lọc"
                )}
            </Button>
        </div>
    );

    // Hiển thị bộ lọc trên desktop
    const desktopFilter = (
        <div className="sticky top-20 hidden md:block">
            <div className="space-y-4">
                <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <h2 className="font-medium">Bộ lọc ({getActiveFilterCount()})</h2>
                </div>
                {filterContent}
            </div>
        </div>
    );

    // Hiển thị bộ lọc trên mobile
    const mobileFilter = (
        <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2" disabled={isPending}>
                        <Filter className="h-4 w-4" />
                        Bộ lọc
                        {getActiveFilterCount() > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {getActiveFilterCount()}
                            </Badge>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="border-t">
                    <SheetHeader>
                        <SheetTitle>Bộ lọc ({getActiveFilterCount()})</SheetTitle>
                    </SheetHeader>
                    {filterContent}
                </SheetContent>
            </Sheet>
        </div>
    );

    // Hiển thị toàn bộ trang
    return (
        <>
            {desktopFilter}
            {mobileFilter}
        </>
    );
}
