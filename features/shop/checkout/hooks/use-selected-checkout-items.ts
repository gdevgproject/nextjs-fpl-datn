import { useQuery } from "@tanstack/react-query";
import { useCartQuery } from "@/features/shop/cart/use-cart";
import type { CartItem } from "@/features/shop/cart/types";

/**
 * Hook để lấy danh sách các sản phẩm đã chọn để thanh toán
 * Sử dụng TanStack Query để đảm bảo dữ liệu được đồng bộ giữa trang giỏ hàng và trang thanh toán
 */
export function useSelectedCheckoutItems() {
  // Lấy toàn bộ giỏ hàng
  const { data: allCartItems = [] } = useCartQuery();

  // Lấy các sản phẩm đã chọn từ TanStack Query cache
  return useQuery({
    queryKey: ["selectedCheckoutItems"],
    queryFn: () => {
      // Nếu không có dữ liệu đã chọn, trả về mảng rỗng
      return [] as CartItem[];
    },
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
    // Không dùng allCartItems làm initialData nữa, sẽ chỉ hiển thị
    // các sản phẩm được chọn từ trang cart
  });
}
