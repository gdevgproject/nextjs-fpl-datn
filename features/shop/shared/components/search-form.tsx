"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Package,
  ChevronDown,
  Brain,
  SearchIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAISearchSuggestions } from "../hooks/use-ai-search-suggestions";
import { SearchSuggestions } from "./search-suggestions";
import { cn } from "@/lib/utils";

const uuidV4Regex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PRODUCT_SEARCH_MAX = 100;
const ORDER_TOKEN_MAX = 50;
const AI_QUERY_MAX = 250;

const searchSchema = z.object({
  query: z.string().min(1, "Vui lòng nhập từ khóa tìm kiếm"),
});

type SearchFormValues = z.infer<typeof searchSchema>;
type SearchMode = "ai" | "order";

export function SearchForm() {
  const router = useRouter();
  const [searchMode, setSearchMode] = useState<SearchMode>("ai");
  const [customError, setCustomError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<number | null>(null);

  // Initialize AI search suggestions hook with options
  const {
    query: aiQuery,
    setQuery: setAiQuery,
    suggestions,
    isLoading: loadingSuggestions,
    isStale: isStaleResults,
    error: suggestionsError,
    rateLimited,
    usingFallbackModel,
  } = useAISearchSuggestions("", {
    // Only enable suggestions when in AI mode
    enabled: searchMode === "ai",
    debounceMs: 700,
    minQueryLength: 2,
    requestCooldown: 1000,
    maxRetryAttempts: 3,
    initialBackoff: 2000,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger,
    clearErrors,
    watch,
    getValues,
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: "" },
    mode: "onChange",
  });

  // Watch current query for suggestions
  const currentQuery = watch("query");

  // Update AI query when current query changes
  useEffect(() => {
    if (searchMode === "ai") {
      setAiQuery(currentQuery || "");
    }
  }, [searchMode, currentQuery, setAiQuery]);

  // Reset form when search mode changes
  useEffect(() => {
    // Clear form
    reset({ query: "" });

    // Clear custom errors
    setCustomError(null);

    // Clear validation errors
    clearErrors();

    // Reset submission status
    setIsSubmitAttempted(false);

    // Hide suggestions
    setShowSuggestions(false);

    // Reset AI query
    setAiQuery("");

    // Reset selected item
    selectedItemRef.current = null;
  }, [searchMode, reset, clearErrors, setAiQuery]);

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
        setShowSuggestions(false);
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
      // For AI mode, just show suggestions instead of navigating
      if (searchMode === "ai") {
        if (value.length > AI_QUERY_MAX) {
          setCustomError(`Câu hỏi không được vượt quá ${AI_QUERY_MAX} ký tự`);
          return;
        }

        // Show suggestions instead of navigating
        setShowSuggestions(true);
        setIsSubmitAttempted(false);
        return;
      }
      // For order lookup, validate and navigate
      else {
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

  // Handle search mode change
  const handleSearchModeChange = (mode: SearchMode) => {
    if (searchMode !== mode) {
      setSearchMode(mode);
    }
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = () => {
    setShowSuggestions(false);
    reset();
    setAiQuery("");
    selectedItemRef.current = null;
  };

  const getSearchPlaceholder = () => {
    switch (searchMode) {
      case "ai":
        return "Hỏi AI về nước hoa, sản phẩm, gợi ý...";
      case "order":
        return "Nhập mã đơn hàng để tra cứu...";
      default:
        return "Hỏi AI về nước hoa, sản phẩm, gợi ý...";
    }
  };

  const getMaxLength = () => {
    switch (searchMode) {
      case "ai":
        return AI_QUERY_MAX;
      case "order":
        return ORDER_TOKEN_MAX;
      default:
        return AI_QUERY_MAX;
    }
  };

  // Only show error when input is focused or user attempted to submit
  const shouldShowError = () => {
    return (
      (isFocused || isSubmitAttempted) && (customError || errors.query?.message)
    );
  };

  // Handle focus events
  const handleFocus = () => {
    setIsFocused(true);
    // Show suggestions when focusing in AI mode
    if (searchMode === "ai" && currentQuery?.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't blur if clicking within the form
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

    // Show suggestions when typing in AI mode
    if (searchMode === "ai" && e.target.value.trim()) {
      setShowSuggestions(true);
      // Reset selected item when input changes
      selectedItemRef.current = null;
    } else {
      setShowSuggestions(false);
    }

    if (e.target.value.trim()) {
      setIsSubmitAttempted(false);
    }

    if (customError) setCustomError(null);
  };

  // Handle search button click
  const handleSearchButtonClick = () => {
    setIsFocused(true);
    setIsSubmitAttempted(true);

    // If input is empty, show error
    if (!inputRef.current?.value.trim()) {
      setCustomError("Vui lòng nhập nội dung tìm kiếm");
      inputRef.current?.focus();
      return;
    }

    // For AI mode, just trigger suggestions instead of submitting form
    if (searchMode === "ai") {
      setShowSuggestions(true);
      return;
    }

    // Otherwise submit the form (for order lookup)
    formRef.current?.requestSubmit();
  };

  // Get search mode attributes
  const getModeAttributes = () => {
    switch (searchMode) {
      case "ai":
        return {
          icon: <Brain className="h-4 w-4 text-primary" />,
          label: "AI",
          activeClass: "text-primary bg-primary/10 border-primary/40",
          loadingIndicator: loadingSuggestions ? (
            <div className="flex items-center space-x-1 ml-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-pulse delay-0"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse delay-150"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse delay-300"></span>
            </div>
          ) : null,
        };
      case "order":
        return {
          icon: <Package className="h-4 w-4 text-amber-500" />,
          label: "Đơn hàng",
          activeClass: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/40",
          loadingIndicator: null,
        };
      default:
        return {
          icon: <Brain className="h-4 w-4 text-primary" />,
          label: "AI",
          activeClass: "text-primary bg-primary/10 border-primary/40",
          loadingIndicator: null,
        };
    }
  };

  const { icon, label, activeClass, loadingIndicator } = getModeAttributes();

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        if (searchMode === "ai") {
          e.preventDefault();
          const query = getValues("query").trim();

          // Show suggestions if query is not empty
          if (query) {
            setShowSuggestions(true);
            setAiQuery(query);
          }
        } else {
          // For order mode, let handleSubmit process it
          handleSubmit(onSubmit)(e);
        }
      }}
      className="w-full relative"
    >
      <div 
        className={cn(
          "flex items-center transition-all duration-300 rounded-lg relative overflow-hidden group h-9",
          isFocused ? "shadow-sm ring-1 ring-primary/20" : ""
        )}
      >
        {/* Mode selector dropdown */}
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center gap-1.5 h-full px-3 text-sm border-r transition-all duration-300 focus:outline-none",
                isFocused ? activeClass : "border-border/30 text-muted-foreground hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-1.5">
                {icon}
                <span className="text-xs font-medium">{label}</span>
                {loadingIndicator}
              </div>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[190px]">
            <DropdownMenuItem 
              onClick={() => handleSearchModeChange("ai")}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2 text-primary">
                <Brain className="h-4 w-4" />
                <span className="font-medium">Chat AI</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleSearchModeChange("order")}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2 text-amber-500">
                <Package className="h-4 w-4" />
                <span className="font-medium">Tra cứu đơn hàng</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search input */}
        <Controller
          name="query"
          control={control}
          render={({ field }) => (
            <div className="flex-1 relative">
              <Input
                {...field}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                ref={(e) => {
                  // Connect ref to both react-hook-form and our local ref
                  field.ref(e);
                  inputRef.current = e;
                }}
                type="search"
                placeholder={getSearchPlaceholder()}
                maxLength={getMaxLength()}
                className={cn(
                  "flex w-full rounded-none border-0 bg-transparent h-9 px-4 text-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:placeholder:text-muted-foreground/70",
                  shouldShowError() ? "placeholder:text-destructive/70" : ""
                )}
                aria-invalid={shouldShowError() ? "true" : "false"}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onChange={(e) => handleInputChange(e, field.onChange)}
                aria-expanded={showSuggestions}
              />
            </div>
          )}
        />

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearchButtonClick}
          className={cn(
            "h-full px-3 flex items-center justify-center transition-all duration-300",
            searchMode === "ai" 
              ? "bg-primary/5 text-primary hover:bg-primary/10" 
              : "bg-amber-50/50 text-amber-600 hover:bg-amber-50 dark:bg-amber-900/10 dark:text-amber-400 dark:hover:bg-amber-900/20"
          )}
          aria-label={searchMode === "ai" ? "Tìm kiếm AI" : "Tra cứu đơn hàng"}
        >
          {loadingSuggestions ? (
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            searchMode === "ai" ? (
              <div className="relative group/icon">
                <Sparkles className="h-4 w-4 group-hover/icon:opacity-0 transition-opacity duration-300" />
                <SearchIcon className="h-4 w-4 absolute inset-0 opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300" />
              </div>
            ) : (
              <SearchIcon className="h-4 w-4" />
            )
          )}
        </button>
      </div>
      
      {/* Error message */}
      {shouldShowError() && (
        <p className="text-xs text-destructive mt-1 ml-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {customError || errors.query?.message}
        </p>
      )}

      {/* AI Search Suggestions dropdown */}
      {searchMode === "ai" && (
        <SearchSuggestions
          query={currentQuery || ""}
          suggestions={suggestions}
          isLoading={loadingSuggestions}
          error={suggestionsError}
          isOpen={showSuggestions}
          isStale={isStaleResults}
          onSelectSuggestion={handleSelectSuggestion}
          selectedItemIndex={selectedItemRef.current}
          rateLimited={rateLimited}
          usingFallbackModel={usingFallbackModel}
        />
      )}
    </form>
  );
}
