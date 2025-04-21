"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { DiscountDialog } from "./discount-dialog";
import { DiscountTable } from "./discount-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Discount, DiscountFilter } from "../types";

export function DiscountManagement() {
  // State for search and filter management
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<DiscountFilter>("all");

  // State for discount dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    []
  );

  const handleOpenCreateDialog = useCallback(() => {
    setEditingDiscount(null);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((discount: Discount) => {
    setEditingDiscount(discount);
    setIsDialogOpen(true);
  }, []);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as DiscountFilter);
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            onValueChange={handleTabChange}
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

            <TabsContent value={activeTab} className="mt-0">
              <DiscountTable
                search={search}
                filter={activeTab}
                onEdit={handleOpenEditDialog}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Discount Dialog - Create/Edit */}
      <DiscountDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        discount={editingDiscount}
        mode={editingDiscount ? "edit" : "create"}
      />
    </div>
  );
}
