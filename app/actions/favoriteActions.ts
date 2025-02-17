// app/actions/favoriteActions.ts
'use server'

import { FavoriteProduct } from '@/lib/mockData'
import { supabase } from '@/lib/supabaseClient'

export async function fetchFavoriteProducts() {
  try {
    const { data, error } = await supabase.from('favorite_products').select('*')
    if (error) throw error
    return data as FavoriteProduct[]
  } catch (error: any) {
    console.error('Error fetching favorite products:', error)
    throw new Error('Failed to fetch favorite products')
  }
}

// Lấy sản phẩm yêu thích của một user cụ thể
export async function fetchFavoritesByUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('favorite_products')
      .select('*, products(*)') // Lấy thông tin sản phẩm
      .eq('user_id', userId)
    if (error) {
      throw error
    }
    //  Chuyển đổi kiểu dữ liệu
    return data as {
      id: string
      user_id: string
      product_id: string
      products: any // Thay 'any' bằng interface/type của Product nếu bạn có
    }[]
  } catch (error: any) {
    console.error('Error fetching favorites by user:', error)
    throw new Error('Failed to fetch favorites by user')
  }
}

export async function createFavorite(favorite: Omit<FavoriteProduct, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('favorite_products')
      .insert([favorite])
      .select()
    if (error) throw error
    return data![0] as FavoriteProduct
  } catch (error: any) {
    console.error('Error creating favorite:', error)
    throw new Error('Failed to create favorite')
  }
}

export async function deleteFavorite(id: string) {
  try {
    const { error } = await supabase
      .from('favorite_products')
      .delete()
      .eq('id', id)
    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting favorite:', error)
    throw new Error('Failed to delete favorite')
  }
}

// Xóa favorite theo user_id và product_id (vì id tự gen)
export async function deleteFavoriteByUserAndProduct(
  userId: string,
  productId: string
) {
  try {
    const { error } = await supabase
      .from('favorite_products')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    if (error) {
      throw error
    }
  } catch (error: any) {
    console.error('Error deleting favorite:', error)
    throw new Error('Failed to delete favorite')
  }
}
