// app/actions/slideGalleryActions.ts
'use server'

import { supabase } from '@/lib/supabaseClient'
import { SlideGallery } from '@/lib/mockData'

export async function fetchSlideGalleries() {
  try {
    const { data, error } = await supabase.from('slide_galleries').select('*')
    if (error) throw error
    return data as SlideGallery[]
  } catch (error: any) {
    console.error('Error fetching slide galleries:', error)
    throw new Error('Failed to fetch slide galleries')
  }
}

export async function createSlideGallery(gallery: Omit<SlideGallery, 'id'>) {
  try {
    const { data, error } = await supabase
      .from('slide_galleries')
      .insert([gallery])
      .select()
    if (error) throw error
    return data![0] as SlideGallery
  } catch (error: any) {
    console.error('Error creating slide gallery:', error)
    throw new Error('Failed to create slide gallery')
  }
}

export async function updateSlideGallery(
  id: string,
  updates: Partial<SlideGallery>
) {
  try {
    const { data, error } = await supabase
      .from('slide_galleries')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data![0] as SlideGallery
  } catch (error: any) {
    console.error('Error updating slide gallery:', error)
    throw new Error('Failed to update slide gallery')
  }
}

export async function deleteSlideGallery(id: string) {
  try {
    const { error } = await supabase
      .from('slide_galleries')
      .delete()
      .eq('id', id)
    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting slide gallery:', error)
    throw new Error('Failed to delete slide gallery')
  }
}
