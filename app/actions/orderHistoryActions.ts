// app/actions/orderHistoryActions.ts
'use server'
import { OrderHistory } from '@/lib/mockData'
import { supabase } from '@/lib/supabaseClient'

export async function fetchOrderHistory(
  orderId: string
): Promise<OrderHistory[]> {
  try {
    const { data, error } = await supabase
      .from('order_histories')
      .select('*')
      .eq('order_id', orderId)
      .order('updated_at', { ascending: false }) // Sắp xếp theo thời gian cập nhật

    if (error) {
      throw error
    }

    return data as OrderHistory[]
  } catch (error: any) {
    console.error('Error fetching order history:', error)
    throw new Error('Failed to fetch order history')
  }
}

export async function createOrderHistory(
  orderHistory: Omit<OrderHistory, 'id' | 'updated_at'>
): Promise<OrderHistory> {
  try {
    const { data, error } = await supabase
      .from('order_histories')
      .insert([orderHistory])
      .select()
    if (error) throw error
    return data![0] as OrderHistory
  } catch (error: any) {
    console.error('Error creating order history:', error)
    throw new Error('Failed to create order history')
  }
}
