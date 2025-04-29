"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Search, Package, ChevronDown, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PRODUCT_SEARCH_MAX = 100;
const ORDER_TOKEN_MAX = 50;
const AI_QUERY_MAX = 250;

const searchSchema = z.object({
  query: z.string().min(1, "Vui lòng nhập từ khóa tìm kiếm"),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export function SearchForm() {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<"ai" | "product" | "order">(
    "ai"
  );
  const [customError, setCustomError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
    clearErrors,
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: "" },
    mode: "onChange",
  });

  // Reset form state when search mode changes
  useEffect(() => {
    // Clear form
    reset({ query: "" });

    // Clear custom errors
    setCustomError(null);

    // Clear validation errors
    clearErrors();

    // Reset submission status
    setIsSubmitAttempted(false);
  }, [searchMode, reset, clearErrors]);

  // Clear error when dropdown is opened
  useEffect(() => {
    if (isDropdownOpen) {
      setCustomError(null);
      clearErrors();
    }
  }, [isDropdownOpen, clearErrors]);

  // Handle clicks outside the form
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsFocused(false);
        setIsSubmitAttempted(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onSubmit = (data: SearchFormValues) => {
    setIsSubmitAttempted(true);
    setCustomError(null);
    const value = data.query.trim();

    if (value.length === 0) {
      setCustomError("Vui lòng nhập nội dung tìm kiếm");
      inputRef.current?.focus();
      return;
    }

    try {
      if (searchMode === "ai") {
        if (value.length > AI_QUERY_MAX) {
          setCustomError(`Câu hỏi không được vượt quá ${AI_QUERY_MAX} ký tự`);
          return;
        }
        router.push(`/ai/tim-kiem?q=${encodeURIComponent(value)}`);
        reset();
        setIsSubmitAttempted(false);
      } else if (searchMode === "product") {
        if (value.length > PRODUCT_SEARCH_MAX) {
          setCustomError(
            `Từ khóa tìm kiếm không được vượt quá ${PRODUCT_SEARCH_MAX} ký tự`
          );
          return;
        }
        router.push(`/san-pham?search=${encodeURIComponent(value)}`);
        reset();
        setIsSubmitAttempted(false);
      } else {
        if (value.length > ORDER_TOKEN_MAX) {
          setCustomError(
            `Mã tra cứu đơn hàng không được vượt quá ${ORDER_TOKEN_MAX} ký tự`
          );
          return;
        }
        if (!uuidV4Regex.test(value)) {
          setCustomError("Mã tra cứu đơn hàng không hợp lệ");
          return;
        }
        router.push(`/tra-cuu-don-hang?token=${encodeURIComponent(value)}`);
        reset();
        setIsSubmitAttempted(false);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // Handle changing search mode
  const handleSearchModeChange = (mode: "ai" | "product" | "order") => {
    if (searchMode !== mode) {
      setSearchMode(mode);
    }
  };

  const getSearchModeLabel = () => {
    switch (searchMode) {
      case "ai":
        return "AI";
      case "product":
        return "Sản phẩm";
      case "order":
        return "Đơn hàng";
      default:
        return "AI";
    }
  };

  const getSearchModeIcon = () => {
    switch (searchMode) {
      case "ai":
        return <Sparkles className="h-4 w-4" />;
      case "product":
        return <Search className="h-4 w-4" />;
      case "order":
        return <Package className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getSearchPlaceholder = () => {
    switch (searchMode) {
      case "ai":
        return "Hỏi AI...";
      case "product":
        return "Tìm sản phẩm...";
      case "order":
        return "Mã đơn hàng...";
      default:
        return "Hỏi AI...";
    }
  };

  const getMaxLength = () => {
    switch (searchMode) {
      case "ai":
        return AI_QUERY_MAX;
      case "product":
        return PRODUCT_SEARCH_MAX;
      case "order":
        return ORDER_TOKEN_MAX;
      default:
        return AI_QUERY_MAX;
    }
  };

  const getInputLeftPadding = () => {
    switch (searchMode) {
      case "ai":
        return "pl-[70px]"; // AI có văn bản ngắn nhất
      case "product":
        return "pl-[105px]"; // Sản phẩm dài hơn
      case "order":
        return "pl-[105px]"; // Đơn hàng cũng tương tự
      default:
        return "pl-[70px]";
    }
  };

  // Only show error when input is focused or user attempted to submit
  const shouldShowError = () => {
    return (
      (isFocused || isSubmitAttempted) && (customError || errors.query?.message)
    );
  };

  // Handle focus events more carefully
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't blur if clicking within the form (like on the icon buttons)
    if (formRef.current && formRef.current.contains(e.relatedTarget as Node)) {
      return;
    }

    // Don't blur when dropdown is open
    if (isDropdownOpen) {
      return;
    }

    // Only remove focus if we're not clicking within our form elements
    setTimeout(() => {
      if (!isDropdownOpen && document.activeElement !== inputRef.current) {
        setIsFocused(false);
      }
    }, 100);
  };

  // Handle input changes and clear errors
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (...event: any[]) => void
  ) => {
    onChange(e);
    if (e.target.value.trim()) {
      setIsSubmitAttempted(false);
    }
    if (customError) setCustomError(null);
  };

  // Handle button click specifically
  const handleSearchButtonClick = () => {
    setIsFocused(true);
    setIsSubmitAttempted(true);

    // If input is empty, show error
    if (!inputRef.current?.value.trim()) {
      setCustomError("Vui lòng nhập nội dung tìm kiếm");
      inputRef.current?.focus();
      return;
    }

    // Otherwise submit the form
    formRef.current?.requestSubmit();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="relative flex w-full items-center">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute left-0 z-10 h-full px-2 text-muted-foreground hover:text-foreground border-r flex items-center gap-1"
            >
              {getSearchModeLabel()}
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[160px]">
            <DropdownMenuItem onClick={() => handleSearchModeChange("ai")}>
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              Tìm kiếm AI
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSearchModeChange("product")}>
              <Search className="mr-2 h-4 w-4" />
              Tìm sản phẩm
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSearchModeChange("order")}>
              <Package className="mr-2 h-4 w-4" />
              Tra cứu đơn hàng
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Controller
          name="query"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              ref={(e) => {
                // Connect the ref to both react-hook-form and our local ref
                field.ref(e);
                inputRef.current = e;
              }}
              type="search"
              placeholder={getSearchPlaceholder()}
              maxLength={getMaxLength()}
              className={`w-full ${getInputLeftPadding()} pr-10 ${
                shouldShowError() ? "border-destructive" : ""
              }`}
              aria-invalid={shouldShowError() ? "true" : "false"}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => handleInputChange(e, field.onChange)}
            />
          )}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-0 h-full"
          onClick={handleSearchButtonClick}
        >
          {getSearchModeIcon()}
        </Button>
      </div>
      {shouldShowError() && (
        <p className="text-xs text-destructive mt-1">
          {customError || errors.query?.message}
        </p>
      )}
    </form>
  );
}
