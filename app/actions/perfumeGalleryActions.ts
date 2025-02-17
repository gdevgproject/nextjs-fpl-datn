// app/actions/perfumeGalleryActions.ts
'use server'

import { supabase } from '@/lib/supabaseClient'
import { PerfumeGallery } from '@/lib/mockData'

export async function fetchPerfumeGalleries() {
  try {
    const { data, error } = await supabase.from('perfume_galleries').select('*')
    if (error) throw error
    return data as PerfumeGallery[]
  } catch (error: any) {
    console.error('Error fetching perfume galleries:', error)
    throw new Error('Failed to fetch perfume galleries')
  }
}

export async function createPerfumeGallery(
  gallery: Omit<PerfumeGallery, 'id'>
) {
  try {
    const { data, error } = await supabase
      .from('perfume_galleries')
      .insert([gallery])
      .select()
    if (error) throw error
    return data![0] as PerfumeGallery
  } catch (error: any) {
    console.error('Error creating perfume gallery:', error)
    throw new Error('Failed to create perfume gallery')
  }
}

export async function updatePerfumeGallery(
  id: string,
  updates: Partial<PerfumeGallery>
) {
  try {
    const { data, error } = await supabase
      .from('perfume_galleries')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    return data![0] as PerfumeGallery
  } catch (error: any) {
    console.error('Error updating perfume gallery:', error)
    throw new Error('Failed to update perfume gallery')
  }
}

export async function deletePerfumeGallery(id: string) {
  try {
    const { error } = await supabase
      .from('perfume_galleries')
      .delete()
      .eq('id', id)
    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting perfume gallery:', error)
    throw new Error('Failed to delete perfume gallery')
  }
}
