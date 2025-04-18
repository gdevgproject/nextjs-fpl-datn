"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthQuery } from "@/features/auth/hooks";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config";
import { handleApiError } from "@/lib/utils/error-utils";

// Định nghĩa kiểu dữ liệu cho wishlist item
export interface WishlistItem {
  id: string;
  product_id: number;
  added_at: string;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
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

  // Fetch wishlist từ database nếu user đã đăng nhập
  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ["wishlist", user?.id, filter],
    queryFn: async () => {
      if (!user) return [];

      try {
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
              price,
              sale_price,
              images:product_images(*)
            )
          `
          )
          .eq("user_id", user.id);

        // Áp dụng filter nếu có
        if (filter?.search) {
          query = query.textSearch("products.name", filter.search, {
            type: "websearch",
            config: "english",
          });
        }

        const { data, error } = await query;

        if (error) throw error;

        // Sắp xếp dữ liệu theo filter
        const sortedData = [...(data as WishlistItem[])];

        if (filter?.sortBy) {
          switch (filter.sortBy) {
            case "newest":
              sortedData.sort(
                (a, b) =>
                  new Date(b.added_at).getTime() -
                  new Date(a.added_at).getTime()
              );
              break;
            case "oldest":
              sortedData.sort(
                (a, b) =>
                  new Date(a.added_at).getTime() -
                  new Date(b.added_at).getTime()
              );
              break;
            case "price_asc":
              sortedData.sort((a, b) => {
                const priceA = a.product.sale_price || a.product.price;
                const priceB = b.product.sale_price || b.product.price;
                return priceA - priceB;
              });
              break;
            case "price_desc":
              sortedData.sort((a, b) => {
                const priceA = a.product.sale_price || a.product.price;
                const priceB = b.product.sale_price || b.product.price;
                return priceB - priceA;
              });
              break;
          }
        } else {
          // Mặc định sắp xếp theo thời gian thêm vào mới nhất
          sortedData.sort(
            (a, b) =>
              new Date(b.added_at).getTime() - new Date(a.added_at).getTime()
          );
        }

        return sortedData;
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        throw new Error(handleApiError(error));
      }
    },
    enabled: !!user,
    staleTime: QUERY_STALE_TIME.USER,
  });

  // Load local wishlist từ localStorage khi component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWishlist = localStorage.getItem("mybeauty_wishlist");
      if (savedWishlist) {
        try {
          setLocalWishlist(JSON.parse(savedWishlist));
        } catch (error) {
          console.error("Error parsing local wishlist:", error);
          localStorage.removeItem("mybeauty_wishlist");
        }
      }
    }
    setIsInitialized(true);
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
          // Thêm các item từ local wishlist vào user wishlist
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

          // Clear local wishlist sau khi merge
          setLocalWishlist([]);
          localStorage.removeItem("mybeauty_wishlist");

          // Invalidate wishlist query để fetch lại wishlist items
          queryClient.invalidateQueries({ queryKey: ["wishlist", user.id] });

          toast("Danh sách yêu thích đã được đồng bộ", {
            description:
              "Các sản phẩm yêu thích của bạn đã được lưu vào tài khoản.",
          });
        } catch (error) {
          console.error("Error merging wishlists:", error);
          toast("Lỗi đồng bộ danh sách yêu thích", {
            description: handleApiError(error),
          });
        }
      }
    };

    mergeLocalWishlistWithUserWishlist();
  }, [isAuthenticated, user, localWishlist, supabase, queryClient, toast]);

  // Kiểm tra sản phẩm có trong wishlist không
  const isInWishlist = (productId: number): boolean => {
    if (isAuthenticated) {
      return !!wishlistItems?.some((item) => item.product_id === productId);
    } else {
      return localWishlist.includes(productId);
    }
  };

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
          console.error("Error adding to wishlist:", error);
          throw new Error(handleApiError(error));
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
      console.error("Error adding to wishlist:", error);
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
          console.error("Error removing from wishlist:", error);
          throw new Error(handleApiError(error));
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
      console.error("Error removing from wishlist:", error);
      toast("Xóa khỏi danh sách yêu thích thất bại", {
        description:
          error instanceof Error
            ? error.message
            : "Đã xảy ra lỗi khi xóa sản phẩm khỏi danh sách yêu thích.",
      });
    },
  });

  // Toggle wishlist
  const toggleWishlist = (productId: number) => {
    if (isInWishlist(productId)) {
      removeFromWishlist.mutate(productId);
    } else {
      addToWishlist.mutate(productId);
    }
  };

  return {
    wishlistItems: wishlistItems || [],
    isLoading,
    isInWishlist,
    addToWishlist: (productId: number) => addToWishlist.mutate(productId),
    removeFromWishlist: (productId: number) =>
      removeFromWishlist.mutate(productId),
    toggleWishlist,
  };
}
