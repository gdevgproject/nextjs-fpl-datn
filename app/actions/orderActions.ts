// app/actions/orderActions.ts
'use server'

import { Order, OrderHistory } from '@/lib/mockData' // Thêm OrderHistory vào đây
import { supabase } from '@/lib/supabaseClient'

export async function fetchOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_products (*, products(*))') // Lấy cả chi tiết đơn hàng
    if (error) throw error
    return data as Order[] // Cần chỉnh sửa type cho phù hợp, tạm thời để Order[]
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    throw new Error('Failed to fetch orders')
  }
}

export async function fetchOrder(id: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_products(*, products(*))') // Lấy thông tin sản phẩm trong chi tiết đơn hàng
      .eq('id', id)
      .single() // Sử dụng .single() vì bạn đang tìm nạp một đơn hàng duy nhất

    if (error) {
      throw error
    }
    // Chú ý: 'data' bây giờ sẽ có cấu trúc phản ánh mối quan hệ,
    // bạn có thể cần điều chỉnh kiểu dữ liệu trả về cho phù hợp
    return data as Order
  } catch (error: any) {
    console.error('Error fetching order:', error)
    throw new Error('Failed to fetch order')
  }
}

export async function fetchOrdersByUserId(userId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_products(*, products(*))') // Lấy thông tin sản phẩm trong chi tiết đơn hàng
      .eq('user_id', userId)

    if (error) {
      throw error
    }
    return data as Order[]
  } catch (error: any) {
    console.error('Error fetching orders by user ID:', error)
    throw new Error('Failed to fetch orders by user ID')
  }
}

export async function createOrder(
  order: Omit<Order, 'id' | 'created_at' | 'updated_at'>
) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
    if (error) throw error
    return data![0] as Order
  } catch (error: any) {
    console.error('Error creating order:', error)
    throw new Error('Failed to create order')
  }
}

// update, delete ít dùng trong Order, thường chỉ update status.  Thêm nếu cần.

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
  updatedBy: string = 'admin'
) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()

    if (error) {
      throw error
    }
    //Tạo bản ghi Order History
    await createOrderHistory({
      order_id: id,
      status: status,
      updated_by: updatedBy,
      note: `Order status change to ${status}`
    })
    return data![0] as Order
  } catch (error: any) {
    console.error('Error updating order status', error)
    throw new Error('Failed to update order status')
  }
}
//Tạo thêm 1 action cho order history
export async function createOrderHistory(
  orderHistory: Omit<OrderHistory, 'id' | 'updated_at'>
): Promise<OrderHistory> {
  // Thêm kiểu dữ liệu trả về ở đây
  try {
    const { data, error } = await supabase
      .from('order_histories')
      .insert([orderHistory])
      .select()
    if (error) {
      throw error
    }
    return data![0] as OrderHistory
  } catch (error: any) {
    console.error('Error create order history: ', error)
    throw new Error('Failed to create order history')
  }
}
