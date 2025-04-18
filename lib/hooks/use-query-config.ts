// Cấu hình mặc định cho React Query
import { QueryClient } from "@tanstack/react-query"

// Thời gian mặc định cho staleTime của các loại dữ liệu
export const QUERY_STALE_TIME = {
  USER: 1000 * 60 * 5, // 5 phút
  PRODUCT: 1000 * 60 * 10, // 10 phút
  CATEGORY: 1000 * 60 * 30, // 30 phút
  CART: 1000 * 60 * 2, // 2 phút
  ORDER: 1000 * 60 * 1, // 1 phút
}

// Tạo QueryClient với cấu hình mặc định
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 phút
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  })
}

