"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import { BannerTable } from "./banner-table";
import { BannerDialog } from "./banner-dialog";
import { useDebounce } from "../hooks/use-debounce";
import { useBanners } from "../hooks/use-banners";

export function BannerManagement() {
  // State for search, pagination, and sorting
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState<string>("display_order");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortingColumn, setSortingColumn] = useState<string | null>(null);

  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedBanner, setSelectedBanner] = useState<any>(null);

  // Debounce search input
  const debouncedSearchTerm = useDebounce(search, 300);
  if (debouncedSearchTerm !== debouncedSearch) {
    setDebouncedSearch(debouncedSearchTerm);
    if (page !== 1) setPage(1); // Reset to first page on new search
  }

  // Fetch banners with filters, pagination, and sorting
  const {
    data: bannersData,
    isLoading,
    isError,
    isFetching,
  } = useBanners(
    { search: debouncedSearch },
    { page, pageSize },
    { column: sortColumn, direction: sortDirection }
  );

  // Handle sort change
  const handleSortChange = (column: string) => {
    // Set the column that's currently being sorted
    setSortingColumn(column);

    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }

    // Clear the sorting indicator after data is loaded
    if (!isFetching) {
      setTimeout(() => setSortingColumn(null), 300);
    }
  };

  // Handle edit banner
  const handleEditBanner = (banner: any) => {
    setSelectedBanner(banner);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  // Handle create new banner
  const handleCreateBanner = () => {
    setSelectedBanner(null);
    setDialogMode("create");
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm banner..."
            className="w-full pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateBanner}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm banner mới
        </Button>
      </div>

      <BannerTable
        banners={bannersData?.data || []}
        count={bannersData?.count || 0}
        isLoading={isLoading}
        isFetching={isFetching}
        sortingColumn={sortingColumn}
        isError={isError}
        page={page}
        pageSize={pageSize}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onSortChange={handleSortChange}
        onEdit={handleEditBanner}
      />

      <BannerDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        mode={dialogMode}
        banner={selectedBanner}
      />
    </div>
  );
}
