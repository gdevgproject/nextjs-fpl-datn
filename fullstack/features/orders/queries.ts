"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/providers/auth-context"
import { QUERY_STALE_TIME } from "@/lib/hooks/use-query-config"
import type { Order, OrderFilter, OrdersResponse } from "./types"
import { cancelOrder } from "./actions"

// Lấy danh sách đơn hàng của người dùng
export function useUserOrders(page = 1, pageSize = 5, filter: OrderFilter = {}) {
  const { user } = useAuth()
  const supabase = getSupabaseBrowserClient()

  return useQuery({
    queryKey: ["orders", user?.id, page, pageSize, filter],
    queryFn: async (): Promise<OrdersResponse> => {
      if (!user) throw new Error("Unauthorized")

      // Tạo query cơ bản
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          order_status:order_statuses(*),
          payment_method:payment_methods(*)
        `,
          { count: "exact" },
        )
        .eq("user_id", user.id)
        .order("order_date", { ascending: false })

      // Áp dụng filter nếu có
      if (filter.status) {
        query = query.eq("order_status_id", filter.status)
      }

      if (filter.dateRange?.from) {
        query = query.gte("order_date", filter.dateRange.from.toISOString())
      }

      if (filter.dateRange?.to) {
        query = query.lte("order_date", filter.dateRange.to.toISOString())
      }

      // Áp dụng phân trang
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: data as Order[],
        count: count || 0,
      }
    },
    enabled: !!user,
    staleTime: QUERY_STALE_TIME.ORDER,
  })
}

// Lấy chi tiết đơn hàng
export function useOrderDetail(orderId: number) {
  const { user } = useAuth()
  const supabase = getSupabaseBrowserClient()

  return useQuery({
    queryKey: ["order", orderId, user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Unauthorized")

      // Lấy thông tin đơn hàng
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          order_status:order_statuses(*),
          payment_method:payment_methods(*)
        `)
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single()

      if (orderError) throw orderError

      // Lấy các item trong đơn hàng
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          variant:product_variants(
            *,
            products:products(
              id,
              name,
              slug,
              images:product_images(*)
            )
          )
        `)
        .eq("order_id", orderId)

      if (itemsError) throw itemsError

      return {
        ...order,
        items: orderItems,
      } as Order
    },
    enabled: !!user && !!orderId,
    staleTime: QUERY_STALE_TIME.ORDER,
  })
}

// Hook để hủy đơn hàng
export function useCancelOrder() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: number) => {
      if (!user) throw new Error("Unauthorized")

      const result = await cancelOrder(orderId)

      if (result.error) {
        throw new Error(result.error)
      }

      return result
    },
    // Cập nhật cache ngay lập tức để UI phản hồi nhanh chóng
    onMutate: async (orderId) => {
      // Hủy các queries đang chạy để tránh ghi đè
      await queryClient.cancelQueries({ queryKey: ["order", orderId, user?.id] })

      // Lưu trữ state trước đó để có thể rollback nếu có lỗi
      const previousOrder = queryClient.getQueryData<Order>(["order", orderId, user?.id])

      // Cập nhật cache ngay lập tức
      if (previousOrder) {
        queryClient.setQueryData<Order>(["order", orderId, user?.id], (old) => {
          if (!old) return previousOrder

          // Cập nhật trạng thái đơn hàng thành "Cancelled"
          return {
            ...old,
            order_status_id: 5, // ID của trạng thái "Cancelled"
            order_status: {
              id: 5,
              name: "Cancelled",
            },
          }
        })
      }

      // Trả về context để sử dụng trong onError
      return { previousOrder }
    },
    // Nếu có lỗi, rollback lại state trước đó
    onError: (error, variables, context) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(["order", variables, user?.id], context.previousOrder)
      }
    },
    // Sau khi mutation thành công, invalidate queries để fetch lại dữ liệu mới
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId, user?.id] })
      queryClient.invalidateQueries({ queryKey: ["orders", user?.id] })
    },
  })
}

// Lấy danh sách trạng thái đơn hàng
export function useOrderStatuses() {
  const supabase = getSupabaseBrowserClient()

  return useQuery({
    queryKey: ["orderStatuses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("order_statuses").select("*").order("id")

      if (error) throw error

      return data
    },
    staleTime: Number.POSITIVE_INFINITY, // Dữ liệu này ít khi thay đổi
  })
}

// Function to get order details by ID (for the order confirmation page)
export async function getOrderDetails(orderId: string) {
  try {
    const supabase = getSupabaseBrowserClient()

    // Get order details with related data
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        recipient_name,
        recipient_phone,
        guest_name,
        guest_email,
        guest_phone,
        province_city,
        district,
        ward,
        street_address,
        delivery_notes,
        payment_status,
        subtotal_amount,
        discount_amount,
        shipping_fee,
        total_amount,
        order_status:order_statuses(id, name),
        payment_method:payment_methods(id, name, description)
      `)
      .eq("id", orderId)
      .single()

    if (orderError) throw orderError

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        id,
        product_name,
        variant_volume_ml,
        quantity,
        unit_price_at_order,
        variant:product_variants(
          id,
          product:products(
            id,
            images:product_images(image_url, is_main)
          )
        )
      `)
      .eq("order_id", orderId)

    if (itemsError) throw itemsError

    // Format the items to include product image
    const formattedItems = items.map((item) => {
      // Find main image or use first available
      const productImages = item.variant?.product?.images || []
      const mainImage = productImages.find((img) => img.is_main) || productImages[0]

      return {
        id: item.id,
        product_name: item.product_name,
        variant_attributes: `${item.variant_volume_ml}ml`,
        quantity: item.quantity,
        price: item.unit_price_at_order,
        product_image: mainImage?.image_url || null,
      }
    })

    // Format shipping address
    const shippingAddress = `${order.recipient_name}, ${order.recipient_phone}, ${order.street_address}, ${order.ward}, ${order.district}, ${order.province_city}`

    // Format customer information
    const customerName = order.guest_name || order.recipient_name
    const customerEmail = order.guest_email || "" // Assuming guest_email could be null
    const customerPhone = order.guest_phone || order.recipient_phone

    return {
      success: true,
      data: {
        id: order.id,
        order_number: order.id, // Using ID as order number
        created_at: order.created_at,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        delivery_notes: order.delivery_notes,
        payment_method: order.payment_method?.name || "Không xác định",
        payment_status: order.payment_status,
        shipping_method: "Giao hàng tiêu chuẩn", // Default shipping method
        subtotal: order.subtotal_amount,
        discount: order.discount_amount,
        shipping_fee: order.shipping_fee,
        total: order.total_amount,
        status: order.order_status?.name || "Đang xử lý",
        items: formattedItems,
      },
    }
  } catch (error) {
    console.error("Error fetching order details:", error)
    return {
      success: false,
      error: "Không thể tải thông tin đơn hàng",
    }
  }
}

