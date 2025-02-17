// app/actions/addressActions.ts
'use server';

import { supabase } from '@/lib/supabaseClient';
import { Address } from '@/lib/mockData';

export async function fetchAddresses() {
    try {
        const { data, error } = await supabase.from('addresses').select('*');
        if (error) throw error;
        return data as Address[];
    } catch (error: any) {
        console.error('Error fetching addresses:', error);
        throw new Error('Failed to fetch addresses');
    }
}
export async function fetchAddressesByUserId(userId: string) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
          .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return data as Address[];
    } catch (error:any) {
      console.error('Error fetching addresses by user ID:', error);
      throw new Error('Failed to fetch addresses by user ID');
    }
  }

export async function createAddress(address: Omit<Address, 'id'>) {
  try {
    const { data, error } = await supabase.from('addresses').insert([address]).select();
    if (error) throw error;
    return data![0] as Address; // Trả về bản ghi vừa tạo
  } catch (error: any) {
    console.error('Error creating address:', error);
    throw new Error('Failed to create address');
  }
}

export async function updateAddress(id: string, updates: Partial<Address>) {
  try {
    const { data, error } = await supabase.from('addresses').update(updates).eq('id', id).select();
    if (error) throw error;
    return data![0] as Address;
  } catch (error: any) {
    console.error('Error updating address:', error);
    throw new Error('Failed to update address');
  }
}

export async function deleteAddress(id: string) {
  try {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) throw error;
  } catch (error: any) {
    console.error('Error deleting address:', error);
    throw new Error('Failed to delete address');
  }
}

// Thêm hàm để set 1 address thành default
export async function setDefaultAddress(userId: string, addressId: string) {
     try {
         // Bước 1:  Unset tất cả default addresses của user này
        const { error: unsetError } = await supabase
             .from('addresses')
             .update({ is_default: false })
             .eq('user_id', userId);

         if (unsetError) {
             throw unsetError;
          }
         // Bước 2: Set address được chọn thành default
         const { data, error: setError } = await supabase
             .from('addresses')
             .update({ is_default: true })
             .eq('id', addressId)
             .select();
         if(setError) {
             throw setError
         }
         return data![0] as Address

     } catch (error: any) {
        console.error("Error setting default address", error);
        throw new Error("Failed to set default address")

     }
}