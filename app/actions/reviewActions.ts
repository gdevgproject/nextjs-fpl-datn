// app/actions/reviewActions.ts
'use server'

import { Review } from '@/lib/mockData'
import { supabase } from '@/lib/supabaseClient'

export async function fetchReviews() {
  try {
    const { data, error } = await supabase.from('reviews').select('*')
    if (error) throw error
    return data as Review[]
  } catch (error: any) {
    console.error('Error fetching reviews:', error)
    throw new Error('Failed to fetch reviews')
  }
}

export async function createReview(
  review: Omit<Review, 'id' | 'created_at' | 'updated_at'>
) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
    if (error) throw error
    return data![0] as Review
  } catch (error: any) {
    console.error('Error creating review:', error)
    throw new Error('Failed to create review')
  }
}

export async function updateReview(id: string, updates: Partial<Review>) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data![0] as Review
  } catch (error: any) {
    console.error('Error updating review:', error)
    throw new Error('Failed to update review')
  }
}

export async function deleteReview(id: string) {
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting review:', error)
    throw new Error('Failed to delete review')
  }
}
