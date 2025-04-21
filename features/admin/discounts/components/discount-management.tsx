"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, AlertCircle } from "lucide-react";
import { DiscountDialog } from "./discount-dialog";
import { DiscountTable } from "./discount-table";
import { useDebounce } from "../hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DiscountManagement() {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all"); // Filter modes: "all", "active", "inactive", "expired", "upcoming"
  const [error, setError] = useState<Error | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  // Memoized handlers to prevent unnecessary re-renders
  const handleOpenCreateDialog = useCallback(() => {
    setEditingDiscount(null);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((discount: any) => {
    setEditingDiscount(discount);
    setIsDialogOpen(true);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    []
  );

  const handleError = useCallback((err: Error) => {
    console.error("Discount management error:", err);
    setError(err);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
  }, []);

  // Memoized dialog props
  const dialogProps = useMemo(
    () => ({
      open: isDialogOpen,
      onOpenChange: setIsDialogOpen,
      mode: editingDiscount ? "edit" : ("create" as const),
      discount: editingDiscount,
    }),
    [isDialogOpen, editingDiscount]
  );

  // Memoized table props
  const tableProps = useMemo(
    () => ({
      search: debouncedSearch,
      onEdit: handleOpenEditDialog,
      filter: activeTab,
      onError: handleError,
    }),
    [debouncedSearch, handleOpenEditDialog, activeTab, handleError]
  );

  // Show error state if there's an error
  if (error) {
    return (
      <Alert variant="destructive" className="my-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Đã xảy ra lỗi</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{error.message || "Không thể tải dữ liệu mã giảm giá."}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="w-fit mt-2"
          >
            Thử lại
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Tìm kiếm mã giảm giá..."
                className="pl-8"
                value={search}
                onChange={handleSearchChange}
                aria-label="Tìm kiếm mã giảm giá"
              />
            </div>

            <Button
              onClick={handleOpenCreateDialog}
              className="w-full sm:w-auto"
              size="sm"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm mã giảm giá
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="overflow-x-auto">
              <TabsList className="mb-4 w-full flex flex-nowrap">
                <TabsTrigger value="all" className="flex-1">
                  Tất cả
                </TabsTrigger>
                <TabsTrigger value="active" className="flex-1">
                  Đang hoạt động
                </TabsTrigger>
                <TabsTrigger value="inactive" className="flex-1">
                  Không hoạt động
                </TabsTrigger>
                <TabsTrigger value="expired" className="flex-1">
                  Hết hạn
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="flex-1">
                  Sắp diễn ra
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0 pt-4">
              {/* Responsive scroll area for better handling of large content */}
              <ScrollArea className="h-[calc(100vh-350px)] lg:h-[calc(100vh-300px)]">
                <DiscountTable {...tableProps} />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog */}
      <DiscountDialog {...dialogProps} />
    </div>
  );
}
