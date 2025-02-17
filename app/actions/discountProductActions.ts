// app/actions/discountProductActions.ts
'use server'

import { DiscountProduct } from '@/lib/mockData'
import { supabase } from '@/lib/supabaseClient'

export async function fetchDiscountProducts() {
  try {
    const { data, error } = await supabase.from('discount_products').select('*')
    if (error) throw error
    return data as DiscountProduct[]
  } catch (error: any) {
    console.error('Error fetching discount products:', error)
    throw new Error('Failed to fetch discount products')
  }
}

export async function createDiscountProduct(
  discountProduct: Omit<DiscountProduct, 'id'>
) {
  try {
    const { data, error } = await supabase
      .from('discount_products')
      .insert([discountProduct])
      .select()
    if (error) throw error
    return data![0] as DiscountProduct
  } catch (error: any) {
    console.error('Error creating discount product:', error)
    throw new Error('Failed to create discount product')
  }
}

export async function updateDiscountProduct(
  id: string,
  updates: Partial<DiscountProduct>
) {
  try {
    const { data, error } = await supabase
      .from('discount_products')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    return data![0] as DiscountProduct
  } catch (error: any) {
    console.error('Error updating discount product:', error)
    throw new Error('Failed to update discount product')
  }
}

export async function deleteDiscountProduct(id: string) {
  try {
    const { error } = await supabase
      .from('discount_products')
      .delete()
      .eq('id', id)
    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting discount product:', error)
    throw new Error('Failed to delete discount product')
  }
}
