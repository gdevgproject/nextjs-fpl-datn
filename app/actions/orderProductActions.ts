// app/actions/orderProductActions.ts
'use server'

import { supabase } from '@/lib/supabaseClient'
// import {  } from '@/lib/mockData'; // Không có interface cụ thể, có thể bỏ

export async function fetchOrderProductsByOrderId(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('order_products')
      .select('*, products!inner(*)') // Lấy thông tin sản phẩm, !inner đảm bảo có product
      .eq('order_id', orderId)

    if (error) {
      throw error
    }
    return data as any[] // Chỉnh sửa kiểu dữ liệu nếu cần
  } catch (error: any) {
    console.error('Error fetching order products by order ID:', error)
    throw new Error('Failed to fetch order products by order ID')
  }
}
export async function createOrderProduct(orderProduct: any) {
  try {
    const { data, error } = await supabase
      .from('order_products')
      .insert([orderProduct])
      .select()
    if (error) {
      throw error
    }
    return data![0] as any
  } catch (error: any) {
    console.error('Error create order product: ', error)
    throw new Error('Failed to create order product')
  }
}
