// app/actions/slideActions.ts
'use server'

import { Slide } from '@/lib/mockData'
import { supabase } from '@/lib/supabaseClient'

export async function fetchSlides() {
  try {
    const { data, error } = await supabase.from('slides').select('*')
    if (error) throw error
    return data as Slide[]
  } catch (error: any) {
    console.error('Error fetching slides:', error)
    throw new Error('Failed to fetch slides')
  }
}
export async function fetchSlide(id: string) {
  try {
    const { data, error } = await supabase
      .from('slides')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Slide
  } catch (error: any) {
    console.error('Error fetching slide:', error)
    throw new Error('Failed to fetch slide')
  }
}

export async function createSlide(
  slide: Omit<Slide, 'id' | 'created_at' | 'updated_at'>
) {
  try {
    const { data, error } = await supabase
      .from('slides')
      .insert([slide])
      .select()
    if (error) throw error
    return data![0] as Slide
  } catch (error: any) {
    console.error('Error creating slide:', error)
    throw new Error('Failed to create slide')
  }
}

export async function updateSlide(id: string, updates: Partial<Slide>) {
  try {
    const { data, error } = await supabase
      .from('slides')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data![0] as Slide
  } catch (error: any) {
    console.error('Error updating slide:', error)
    throw new Error('Failed to update slide')
  }
}

export async function deleteSlide(id: string) {
  try {
    const { error } = await supabase.from('slides').delete().eq('id', id)
    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting slide:', error)
    throw new Error('Failed to delete slide')
  }
}
