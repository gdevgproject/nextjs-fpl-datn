"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthQuery } from "@/features/auth/hooks";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config";

// Định nghĩa kiểu dữ liệu cho wishlist item
export interface WishlistItem {
  id: string;
  product_id: number;
  added_at: string;
  product: {
    id: number;
    name: string;
    slug: string;
    brand: {
      id: number;
      name: string;
    };
    variants: {
      id: number;
      price: number;
      sale_price: number | null;
      stock_quantity: number;
      volume_ml: number;
    }[];
    images: any[];
  };
}

// Định nghĩa kiểu dữ liệu cho filter
export interface WishlistFilter {
  sortBy?: "newest" | "oldest" | "price_asc" | "price_desc";
  search?: string;
}

export function useWishlist(filter?: WishlistFilter) {
  const { data: session } = useAuthQuery();
  const user = session?.user;
  const isAuthenticated = !!user;
  const supabase = getSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const { toast } = useSonnerToast();
  const [localWishlist, setLocalWishlist] = useState<number[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [wishlistFilter, setWishlistFilter] = useState<WishlistFilter>(
    filter || {}
  );

  // Lấy danh sách sản phẩm yêu thích từ Supabase
  const fetchWishlistItems = useCallback(async () => {
    if (!user) return [];

    try {
      // Build query
      let query = supabase
        .from("wishlists")
        .select(
          `
          id,
          product_id,
          added_at,
          products:products (
            id,
            name,
            slug,
            brand:brands(id, name),
            variants:product_variants(
              id,
              price,
              sale_price,
              stock_quantity,
              volume_ml
            ),
            images:product_images(*)
          )
        `
        )
        .eq("user_id", user.id);

      // Áp dụng tìm kiếm nếu có
      if (wishlistFilter?.search) {
        query = query.textSearch("products.name", wishlistFilter.search, {
          type: "websearch",
          config: "english",
        });
      }

      // Thực thi truy vấn
      const { data, error } = await query;

      // Nếu lỗi là lỗi thực sự (không phải lỗi "no rows")
      if (error) {
        const errorMsg = error.message;
        if (
          errorMsg !== "{}" &&
          !errorMsg.includes("No rows") &&
          !errorMsg.includes("not found")
        ) {
          console.log("Wishlist API error (non-critical):", errorMsg);
        }
        // Trả về mảng rỗng dù có lỗi gì đi nữa
        return [];
      }

      // Đảm bảo kết quả là mảng
      const rawItems = Array.isArray(data) ? data : [];
      // Unwrap joined 'products' array into single 'product' object
      const mappedItems = rawItems.map((item: any) => {
        const rawProd = item.products;
        const prod = Array.isArray(rawProd) ? rawProd[0] : rawProd;
        return {
          id: item.id,
          product_id: item.product_id,
          added_at: item.added_at,
          product: prod || null,
        };
      });
      // Lọc bỏ mục không có product
      const items = mappedItems.filter((item) => item.product);

      // Sắp xếp và xử lý kết quả
      if (items.length > 0) {
        const sortedItems = [...items];

        switch (wishlistFilter?.sortBy) {
          case "newest":
            sortedItems.sort(
              (a, b) =>
                new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
            );
            break;
          case "oldest":
            sortedItems.sort(
              (a, b) =>
                new Date(a.added_at).getTime() - new Date(b.added_at).getTime()
            );
            break;
          case "price_asc":
            sortedItems.sort((a, b) => {
              const priceA = a.product?.sale_price ?? a.product?.price ?? 0;
              const priceB = b.product?.sale_price ?? b.product?.price ?? 0;
              return priceA - priceB;
            });
            break;
          case "price_desc":
            sortedItems.sort((a, b) => {
              const priceA = a.product?.sale_price ?? a.product?.price ?? 0;
              const priceB = b.product?.sale_price ?? b.product?.price ?? 0;
              return priceB - priceA;
            });
            break;
          default:
            // Mặc định sắp xếp theo thời gian thêm vào mới nhất
            sortedItems.sort(
              (a, b) =>
                new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
            );
        }

        return sortedItems;
      }

      return items;
    } catch (e) {
      // Không throw lỗi, chỉ log và trả về mảng rỗng
      console.log("Error in wishlist query (returning empty array):", e);
      return [];
    }
  }, [supabase, user, wishlistFilter]);

  // Query hook để lấy danh sách wishlist
  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ["wishlist", user?.id, wishlistFilter],
    queryFn: fetchWishlistItems,
    enabled: isAuthenticated,
    staleTime: QUERY_STALE_TIME.USER,
    retry: 1, // Chỉ retry 1 lần nếu có lỗi
    retryDelay: 1000, // Chờ 1 giây trước khi retry
  });

  // Load local wishlist từ localStorage khi component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedWishlist = localStorage.getItem("mybeauty_wishlist");
        if (savedWishlist) {
          setLocalWishlist(JSON.parse(savedWishlist));
        }
      } catch (error) {
        console.log("Error parsing local wishlist:", error);
        localStorage.removeItem("mybeauty_wishlist");
      }
      setIsInitialized(true);
    }
  }, []);

  // Lưu local wishlist vào localStorage khi thay đổi
  useEffect(() => {
    if (isInitialized && !isAuthenticated && typeof window !== "undefined") {
      localStorage.setItem("mybeauty_wishlist", JSON.stringify(localWishlist));
    }
  }, [localWishlist, isInitialized, isAuthenticated]);

  // Merge local wishlist với user wishlist khi đăng nhập
  useEffect(() => {
    const mergeLocalWishlistWithUserWishlist = async () => {
      if (isAuthenticated && user && localWishlist.length > 0) {
        try {
          // Bắt đầu một transaction: thêm các item vào wishlist
          for (const productId of localWishlist) {
            await supabase.from("wishlists").upsert(
              {
                user_id: user.id,
                product_id: productId,
              },
              {
                onConflict: "user_id, product_id",
                ignoreDuplicates: true,
              }
            );
          }

          // Xóa local wishlist sau khi merge
          setLocalWishlist([]);
          if (typeof window !== "undefined") {
            localStorage.removeItem("mybeauty_wishlist");
          }

          // Refresh danh sách
          queryClient.invalidateQueries({ queryKey: ["wishlist", user.id] });

          toast("Danh sách yêu thích đã được đồng bộ", {
            description:
              "Các sản phẩm yêu thích của bạn đã được lưu vào tài khoản.",
          });
        } catch (error) {
          console.log("Error merging wishlists (non-critical):", error);
        }
      }
    };

    mergeLocalWishlistWithUserWishlist();
  }, [isAuthenticated, user, localWishlist, supabase, queryClient, toast]);

  // Kiểm tra sản phẩm có trong wishlist không
  const isInWishlist = useCallback(
    (productId: number): boolean => {
      if (isAuthenticated) {
        return wishlistItems.some((item) => item.product_id === productId);
      } else {
        return localWishlist.includes(productId);
      }
    },
    [isAuthenticated, wishlistItems, localWishlist]
  );

  // Thêm sản phẩm vào wishlist
  const addToWishlist = useMutation({
    mutationFn: async (productId: number) => {
      if (isAuthenticated && user) {
        try {
          const { error } = await supabase.from("wishlists").insert({
            user_id: user.id,
            product_id: productId,
          });

          if (error) throw error;
          return { success: true };
        } catch (error) {
          console.log("Error adding to wishlist:", error);
          throw new Error("Không thể thêm vào danh sách yêu thích");
        }
      } else {
        // Xử lý local wishlist
        if (!localWishlist.includes(productId)) {
          setLocalWishlist([...localWishlist, productId]);
        }
        return { success: true };
      }
    },
    onSuccess: () => {
      if (isAuthenticated && user) {
        queryClient.invalidateQueries({ queryKey: ["wishlist", user.id] });
      }

      toast("Đã thêm vào danh sách yêu thích", {
        description: "Sản phẩm đã được thêm vào danh sách yêu thích của bạn.",
      });
    },
    onError: (error) => {
      toast("Thêm vào danh sách yêu thích thất bại", {
        description:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi thêm sản phẩm vào danh sách yêu thích.",
      });
    },
  });

  // Xóa sản phẩm khỏi wishlist
  const removeFromWishlist = useMutation({
    mutationFn: async (productId: number) => {
      if (isAuthenticated && user) {
        try {
          const { error } = await supabase
            .from("wishlists")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", productId);

          if (error) throw error;
          return { success: true };
        } catch (error) {
          console.log("Error removing from wishlist:", error);
          throw new Error("Không thể xóa khỏi danh sách yêu thích");
        }
      } else {
        // Xử lý local wishlist
        setLocalWishlist(localWishlist.filter((id) => id !== productId));
        return { success: true };
      }
    },
    onSuccess: () => {
      if (isAuthenticated && user) {
        queryClient.invalidateQueries({ queryKey: ["wishlist", user.id] });
      }

      toast("Đã xóa khỏi danh sách yêu thích", {
        description: "Sản phẩm đã được xóa khỏi danh sách yêu thích của bạn.",
      });
    },
    onError: (error) => {
      toast("Xóa khỏi danh sách yêu thích thất bại", {
        description:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi xóa sản phẩm khỏi danh sách yêu thích.",
      });
    },
  });

  // Toggle wishlist
  const toggleWishlist = useCallback(
    async (productId: number) => {
      if (isInWishlist(productId)) {
        await removeFromWishlist.mutate(productId);
      } else {
        await addToWishlist.mutate(productId);
      }
    },
    [isInWishlist, removeFromWishlist, addToWishlist]
  );

  // Return các giá trị và hàm cần thiết
  return {
    wishlistItems,
    isLoading,
    isInWishlist,
    toggleWishlist,
    addToWishlist: (productId: number) => addToWishlist.mutate(productId),
    removeFromWishlist: (productId: number) =>
      removeFromWishlist.mutate(productId),
    filter: wishlistFilter,
    setFilter: setWishlistFilter,
  };
}
