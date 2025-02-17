// app/actions/discountActions.ts
'use server'

import { supabase } from '@/lib/supabaseClient'
import { Discount } from '@/lib/mockData'

export async function fetchDiscounts() {
  try {
    const { data, error } = await supabase.from('discounts').select('*')
    if (error) throw error
    return data as Discount[]
  } catch (error: any) {
    console.error('Error fetching discounts:', error)
    throw new Error('Failed to fetch discounts')
  }
}
export async function fetchDiscount(id: string) {
  try {
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Discount
  } catch (error: any) {
    console.error('Error fetching discount:', error)
    throw new Error('Failed to fetch discount')
  }
}
export async function createDiscount(
  discount: Omit<Discount, 'id' | 'created_at' | 'updated_at'>
) {
  try {
    const { data, error } = await supabase
      .from('discounts')
      .insert([discount])
      .select()
    if (error) throw error
    return data![0] as Discount
  } catch (error: any) {
    console.error('Error creating discount:', error)
    throw new Error('Failed to create discount')
  }
}

export async function updateDiscount(id: string, updates: Partial<Discount>) {
  try {
    const { data, error } = await supabase
      .from('discounts')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data![0] as Discount
  } catch (error: any) {
    console.error('Error updating discount:', error)
    throw new Error('Failed to update discount')
  }
}

export async function deleteDiscount(id: string) {
  try {
    const { error } = await supabase.from('discounts').delete().eq('id', id)
    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting discount:', error)
    throw new Error('Failed to delete discount')
  }
}
