import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCartQuery } from "./use-cart";
import { useAuthQuery } from "@/features/auth/hooks";
import type { CartItem } from "./types";

const SELECTED_ITEMS_KEY = "selectedCartItems";

/**
 * Custom hook để quản lý danh sách sản phẩm đã chọn trong giỏ hàng
 * Lưu trữ các item IDs đã chọn trong localStorage và khôi phục khi cần thiết
 */
export function useSelectedCartItems() {
  const { data: session } = useAuthQuery();
  const { data: cartItems = [] } = useCartQuery();
  const isAuthenticated = !!session?.user;
  const queryClient = useQueryClient();

  // State để lưu trữ IDs của các sản phẩm được chọn
  const [selectedItemIds, setSelectedItemIds] = useState<(string | number)[]>(
    []
  );

  // Load selected item IDs từ localStorage khi component mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(SELECTED_ITEMS_KEY);
      if (stored) {
        const parsedIds = JSON.parse(stored);
        setSelectedItemIds(parsedIds);
      }
    } catch (err) {
      console.error("Error loading selected cart items:", err);
      localStorage.removeItem(SELECTED_ITEMS_KEY);
    }
  }, []);

  // Cập nhật localStorage mỗi khi selectedItemIds thay đổi
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SELECTED_ITEMS_KEY, JSON.stringify(selectedItemIds));
  }, [selectedItemIds]);

  // Reset selected items khi người dùng đăng nhập/đăng xuất
  useEffect(() => {
    setSelectedItemIds([]);
  }, [isAuthenticated]);

  // Lấy key của item (id cho user đăng nhập, variant_id cho guest)
  const getItemKey = (item: CartItem): string | number => {
    return isAuthenticated ? String(item.id) : item.variant_id;
  };

  // Check if an item is selected
  const isItemSelected = (item: CartItem): boolean => {
    const key = getItemKey(item);
    return selectedItemIds.includes(key);
  };

  // Select or deselect an item
  const toggleItemSelection = (item: CartItem, isSelected: boolean) => {
    const key = getItemKey(item);
    setSelectedItemIds((prev) =>
      isSelected ? [...prev, key] : prev.filter((id) => id !== key)
    );
  };

  // Select all items
  const selectAllItems = () => {
    const allKeys = cartItems.map(getItemKey);
    setSelectedItemIds(allKeys);
  };

  // Deselect all items
  const deselectAllItems = () => {
    setSelectedItemIds([]);
  };

  // Toggle select all
  const toggleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      selectAllItems();
    } else {
      deselectAllItems();
    }
  };

  // Get selected items
  const selectedItems = cartItems.filter((item) => isItemSelected(item));

  // Clear selected items
  const clearSelectedItems = () => {
    setSelectedItemIds([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SELECTED_ITEMS_KEY);
    }
  };

  // Prefetch selected items for checkout page
  const prefetchSelectedItemsForCheckout = () => {
    queryClient.setQueryData("selectedCheckoutItems", selectedItems);
  };

  return {
    selectedItemIds,
    selectedItems,
    isItemSelected,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    toggleSelectAll,
    clearSelectedItems,
    prefetchSelectedItemsForCheckout,
  };
}
