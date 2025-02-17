// app/actions/userActions.ts
'use server'

import { User } from '@/lib/mockData'
import { supabase } from '@/lib/supabaseClient'

export async function fetchUsers(): Promise<Omit<User, 'password'>[]> {
  try {
    const { data, error } = await supabase.from('users').select('*')
    if (error) throw error

    // Loại bỏ trường password trước khi trả về
    return data.map(({ password, ...user }) => user) as Omit<User, 'password'>[]
  } catch (error: any) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users')
  }
}

export async function fetchUser(
  id: string
): Promise<Omit<User, 'password'> | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error

    if (data) {
      const { password, ...userWithoutPassword } = data
      return userWithoutPassword as Omit<User, 'password'>
    }
    return null
  } catch (error: any) {
    console.error('Error fetching user:', error)
    throw new Error('Failed to fetch user')
  }
}

export async function updateUser(
  id: string,
  updates: Partial<Omit<User, 'id' | 'password'>>
): Promise<Omit<User, 'password'> | null> {
  // Bỏ password khỏi updates
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
    if (error) throw error
    if (data) {
      const { password, ...userWithoutPassword } = data[0]
      return userWithoutPassword as Omit<User, 'password'>
    }
    return null
  } catch (error: any) {
    console.error('Error updating user:', error)
    throw new Error('Failed to update user')
  }
}

export async function deleteUser(id: string) {
  try {
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) throw error
  } catch (error: any) {
    console.error('Error deleting user:', error)
    throw new Error('Failed to delete user')
  }
}

// Thêm hàm đổi role, block/unblock (dùng trong trang edit user)
export async function changeUserRole(userId: string, newRole: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role_id: newRole })
      .eq('id', userId)
      .select()
    if (error) throw error
    if (data) {
      const { password, ...userWithoutPassword } = data[0]
      return userWithoutPassword as Omit<User, 'password'>
    }
    return null
  } catch (error: any) {
    console.error('Error changing user role:', error)
    throw new Error('Failed to change user role')
  }
}

export async function changeUserStatus(
  userId: string,
  newStatus: 'active' | 'inactive' | 'blocked'
) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', userId)
      .select()
    if (error) throw error
    if (data) {
      const { password, ...userWithoutPassword } = data[0]
      return userWithoutPassword as Omit<User, 'password'>
    }
    return null
  } catch (error: any) {
    console.error('Error changing user status:', error)
    throw new Error('Failed to change user status')
  }
}
// Các hàm liên quan authentication (login, register,...) bạn nên xử lý trực tiếp với Supabase Auth, không cần Server Actions cho những cái này.
