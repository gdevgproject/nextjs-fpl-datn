// app/actions/productActions.ts
'use server'

import { supabase } from '@/lib/supabaseClient'
import { Product } from '@/lib/mockData'

export async function fetchProducts() {
  try {
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
      throw error
    }
    return data as Product[]
  } catch (error: any) {
    console.error('Error fetch products: ', error)
    throw new Error('Failed to fetch products')
  }
}

export async function fetchProduct(id: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }
    return data as Product
  } catch (error: any) {
    console.error('Error fetch product', error)
    throw new Error('Failed to fetch a product')
  }
}

export async function createProduct(
  productData: Omit<
    Product,
    'id' | 'created_at' | 'updated_at' | 'perfume_code'
  >
) {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()

    if (error) {
      throw error
    }
    return data![0] as Product // Thường trả về bản ghi vừa tạo
  } catch (error: any) {
    console.error('Error Create Product: ', error)
    throw new Error('Failed to create product')
  }
}

export async function updateProduct(id: string, updateData: Partial<Product>) {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      throw error
    }
    return data![0] as Product
  } catch (error: any) {
    console.error('Error Update Product', error)
    throw new Error('Failed to update product')
  }
}

export async function deleteProduct(id: string) {
  try {
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
      throw error
    }
  } catch (error: any) {
    console.error('Error Delete Product', error)
    throw new Error('Failed to delete product')
  }
}
