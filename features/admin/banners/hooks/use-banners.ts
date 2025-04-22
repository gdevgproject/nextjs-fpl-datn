"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BannersFilters,
  BannersPagination,
  BannersResponse,
  BannersSort,
} from "../types";
import { fetchBanners } from "../services";

/**
 * Custom hook to fetch banners with filtering, pagination, and sorting
 * Using TanStack Query for data fetching and caching
 */
export function useBanners(
  filters?: BannersFilters,
  pagination?: BannersPagination,
  sort?: BannersSort
) {
  return useQuery<BannersResponse, Error>({
    queryKey: ["banners", "list", filters, pagination, sort],
    queryFn: () => fetchBanners(filters, pagination, sort),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes - data is considered fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes - keep unused data in cache for 10 minutes
  });
}
