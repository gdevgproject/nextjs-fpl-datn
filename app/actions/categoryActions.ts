// app/actions/categoryActions.ts
'use server'

import { supabase } from '@/lib/supabaseClient'
import { Category } from '@/lib/mockData'

export async function fetchCategories() {
  try {
    const { data, error } = await supabase.from('categories').select('*')
    if (error) throw error
    return data as Category[]
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    throw new Error('Failed to fetch categories')
  }
}

export async function createCategory(
  category: Omit<Category, 'id' | 'created_at' | 'updated_at'>
) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
    if (error) throw error
    return data![0] as Category
  } catch (error: any) {
    console.error('Error creating category:', error)
    throw new Error('Failed to create category')
  }
}

export async function updateCategory(id: string, updates: Partial<Category>) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data![0] as Category
  } catch (error: any) {
    console.error('Error updating category:', error)
    throw new Error('Failed to update category')
  }
}

export async function deleteCategory(id: string) {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting category:', error)
    throw new Error('Failed to delete category')
  }
}
