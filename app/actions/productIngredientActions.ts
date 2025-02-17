// app/actions/productIngredientActions.ts
'use server'

import { supabase } from '@/lib/supabaseClient'
//import {  } from '@/lib/mockData';  // Không có interface cụ thể

export async function fetchIngredientsByProductId(productId: string) {
  try {
    const { data, error } = await supabase
      .from('product_ingredients')
      .select('ingredient') // Chỉ lấy cột ingredient
      .eq('product_id', productId)

    if (error) {
      throw error
    }

    // Chuyển đổi data thành mảng string[]
    return data.map((item: any) => item.ingredient) as string[]
  } catch (error: any) {
    console.error('Error fetching ingredients by product ID:', error)
    throw new Error('Failed to fetch ingredients by product ID')
  }
}
export async function createProductIngredient(productIngredient: {
  product_id: string
  ingredient: string
}) {
  try {
    const { data, error } = await supabase
      .from('product_ingredients')
      .insert([productIngredient])
      .select()
    if (error) throw error
    return data![0] as any // Điều chỉnh kiểu dữ liệu nếu cần
  } catch (error: any) {
    console.error('Error creating product ingredient:', error)
    throw new Error('Failed to create product ingredient')
  }
}
