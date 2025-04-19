import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCartItems,
  addToCart as addServiceItem,
  updateCartItem as updateServiceItem,
  removeCartItem as removeServiceItem,
  clearCart as clearServiceCart,
} from "./services";
import {
  getGuestCart,
  setGuestCart,
  addGuestCartItem,
  updateGuestCartItemQuantity,
  removeGuestCartItem,
  clearGuestCart,
} from "./guest-cart";
import { useAuthQuery } from "@/features/auth/hooks";
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config";
import { getProductVariantDetails } from "./cart-actions";
import { useMemo } from "react";

// Unified Cart Query (Handles both Guest and Authenticated)
export function useCartQuery() {
  const { data: session, isLoading: isSessionLoading } = useAuthQuery();
  const isAuthenticated = !!session?.user;
  const queryClient = useQueryClient();

  // For authenticated users, we need to ensure we don't flash an empty cart
  const initialData = useMemo(() => {
    if (typeof window === "undefined") return [];

    // For guest users, always use localStorage data
    if (!isAuthenticated) {
      return getGuestCart();
    }

    // For authenticated users, check if we have existing cart data in the cache
    const existingData = queryClient.getQueryData(["cart", true]);
    if (existingData) {
      return existingData;
    }

    // If no cached data, don't set a placeholder (will show loading state)
    return undefined;
  }, [isAuthenticated, queryClient]);

  return useQuery({
    queryKey: ["cart", isAuthenticated],
    queryFn: async () => {
      if (isAuthenticated) {
        return fetchCartItems();
      } else {
        return getGuestCart();
      }
    },
    staleTime: QUERY_STALE_TIME.CART,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    placeholderData: initialData,
    enabled: typeof window !== "undefined" && !isSessionLoading,
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;

  return useMutation({
    mutationFn: async (vars: {
      variantId: number;
      quantity: number;
      productId?: string;
    }) => {
      if (isAuthenticated) {
        return addServiceItem(vars.variantId, vars.quantity);
      } else {
        // Fetch product details before adding to guest cart
        const detailsResult = await getProductVariantDetails(vars.variantId);
        if (!detailsResult.success || !detailsResult.data) {
          throw new Error("Could not fetch product details for guest cart.");
        }
        const guestItem: CartItem = {
          id: `guest-${Date.now()}`,
          variant_id: vars.variantId,
          quantity: vars.quantity,
          product: detailsResult.data,
        };
        addGuestCartItem(guestItem);
        return guestItem;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", isAuthenticated] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;

  return useMutation({
    mutationFn: async (vars: {
      itemIdOrVariantId: string | number;
      quantity: number;
    }) => {
      if (isAuthenticated) {
        if (typeof vars.itemIdOrVariantId !== "string") {
          throw new Error("Invalid item ID for authenticated user.");
        }
        return updateServiceItem(vars.itemIdOrVariantId, vars.quantity);
      } else {
        if (typeof vars.itemIdOrVariantId !== "number") {
          throw new Error("Invalid variant ID for guest user.");
        }
        updateGuestCartItemQuantity(vars.itemIdOrVariantId, vars.quantity);
        return { variantId: vars.itemIdOrVariantId, quantity: vars.quantity };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", isAuthenticated] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;

  return useMutation({
    mutationFn: async (itemIdOrVariantId: string | number) => {
      if (isAuthenticated) {
        if (typeof itemIdOrVariantId !== "string") {
          throw new Error("Invalid item ID for authenticated user.");
        }
        return removeServiceItem(itemIdOrVariantId);
      } else {
        if (typeof itemIdOrVariantId !== "number") {
          throw new Error("Invalid variant ID for guest user.");
        }
        removeGuestCartItem(itemIdOrVariantId);
        return itemIdOrVariantId;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", isAuthenticated] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const { data: session } = useAuthQuery();
  const isAuthenticated = !!session?.user;

  return useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        return clearServiceCart();
      } else {
        clearGuestCart();
        return true;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", isAuthenticated] });
    },
  });
}
