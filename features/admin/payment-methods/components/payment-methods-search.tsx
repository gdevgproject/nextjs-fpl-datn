"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useDebounce } from "../hooks/use-debounce";

interface PaymentMethodsSearchProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export function PaymentMethodsSearch({
  onSearch,
  placeholder = "Tìm kiếm phương thức thanh toán...",
  initialValue = "",
}: PaymentMethodsSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);

  // Use debounce to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Update parent component when debounced value changes
  useState(() => {
    onSearch(debouncedSearchTerm);
  });

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Clear search
  const handleClear = useCallback(() => {
    setSearchTerm("");
  }, []);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        className="w-full pl-10 pr-10"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
      />
      {searchTerm && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      )}
    </div>
  );
}
