import type { Product } from "../products/types";

/**
 * Represents a product in the wishlist
 */
export interface WishlistItem {
  id: number;
  user_id: string;
  product_id: number;
  added_at?: string;
  product?: Product;
}

/**
 * Filter options for wishlist
 */
export interface WishlistFilter {
  search?: string;
  sortBy?: "newest" | "oldest" | "price_asc" | "price_desc";
}

/**
 * Context type for the wishlist provider
 */
export interface WishlistContextType {
  wishlistItems: number[];
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isLoading?: boolean;
  filter?: WishlistFilter;
  setFilter?: (filter: WishlistFilter) => void;
}
