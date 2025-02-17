// app/actions/brandActions.ts
'use server'

import { Brand } from '@/lib/mockData'
import { supabase } from '@/lib/supabaseClient'

export async function fetchBrands() {
  try {
    const { data, error } = await supabase.from('brands').select('*')
    if (error) throw error
    return data as Brand[]
  } catch (error: any) {
    console.error('Error fetching brands:', error)
    throw new Error('Failed to fetch brands')
  }
}

export async function fetchBrand(id: string) {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Brand
  } catch (error: any) {
    console.error('Error fetching brand:', error)
    throw new Error('Failed to fetch brand')
  }
}

export async function createBrand(
  brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>
) {
  try {
    const { data, error } = await supabase
      .from('brands')
      .insert([brand])
      .select()
    if (error) throw error
    return data![0] as Brand
  } catch (error: any) {
    console.error('Error creating brand:', error)
    throw new Error('Failed to create brand')
  }
}

export async function updateBrand(id: string, updates: Partial<Brand>) {
  try {
    const { data, error } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data![0] as Brand
  } catch (error: any) {
    console.error('Error updating brand:', error)
    throw new Error('Failed to update brand')
  }
}

export async function deleteBrand(id: string) {
  try {
    const { error } = await supabase.from('brands').delete().eq('id', id)
    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting brand:', error)
    throw new Error('Failed to delete brand')
  }
}
