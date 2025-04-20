"use client";

import { usePaymentMethodsFetch } from "./use-payment-methods-hooks";

interface PaymentMethodsFilters {
  search?: string;
}

interface PaymentMethodsPagination {
  page: number;
  pageSize: number;
}

interface PaymentMethodsSort {
  column: string;
  direction: "asc" | "desc";
}

export function usePaymentMethods(
  filters?: PaymentMethodsFilters,
  pagination?: PaymentMethodsPagination,
  sort?: PaymentMethodsSort
) {
  return usePaymentMethodsFetch(
    ["payment-methods", "list", filters, pagination, sort],
    {
      filters: {
        search: filters?.search,
      },
      pagination: pagination,
      sort: sort,
    }
  );
}
