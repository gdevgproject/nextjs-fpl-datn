"use server"

import { revalidatePath } from "next/cache"
import { createServerSupabaseClient } from "@/lib/supabase/supabase-server"
import { getSession } from "@/lib/supabase/supabase-server"

interface AddressData {
  recipient_name: string
  recipient_phone: string
  province_city: string
  district: string
  ward: string
  street_address: string
  is_default: boolean
}

export async function addAddress(data: AddressData) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" }
    }

    const supabase = createServerSupabaseClient()

    // Nếu đây là địa chỉ mặc định, cập nhật tất cả các địa chỉ khác thành không mặc định
    if (data.is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", session.user.id)
    }

    // Thêm địa chỉ mới
    const { data: newAddress, error } = await supabase
      .from("addresses")
      .insert({
        user_id: session.user.id,
        recipient_name: data.recipient_name,
        recipient_phone: data.recipient_phone,
        province_city: data.province_city,
        district: data.district,
        ward: data.ward,
        street_address: data.street_address,
        is_default: data.is_default,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding address:", error)
      return { success: false, error: "Không thể thêm địa chỉ mới" }
    }

    // Nếu đây là địa chỉ mặc định, cập nhật profile
    if (data.is_default) {
      await supabase.from("profiles").update({ default_address_id: newAddress.id }).eq("id", session.user.id)
    }
    // Nếu đây là địa chỉ đầu tiên, tự động đặt làm mặc định
    else {
      const { count } = await supabase
        .from("addresses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)

      if (count === 1) {
        await supabase.from("addresses").update({ is_default: true }).eq("id", newAddress.id)

        await supabase.from("profiles").update({ default_address_id: newAddress.id }).eq("id", session.user.id)
      }
    }

    revalidatePath("/tai-khoan/dia-chi")
    return { success: true }
  } catch (error) {
    console.error("Error in addAddress:", error)
    return { success: false, error: "Đã xảy ra lỗi khi thêm địa chỉ mới" }
  }
}

export async function updateAddress(addressId: number, data: AddressData) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" }
    }

    const supabase = createServerSupabaseClient()

    // Kiểm tra xem địa chỉ có thuộc về người dùng không
    const { data: existingAddress, error: checkError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .eq("user_id", session.user.id)
      .single()

    if (checkError || !existingAddress) {
      return { success: false, error: "Không tìm thấy địa chỉ hoặc bạn không có quyền chỉnh sửa" }
    }

    // Nếu đây là địa chỉ mặc định, cập nhật tất cả các địa chỉ khác thành không mặc định
    if (data.is_default && !existingAddress.is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", session.user.id)
    }

    // Cập nhật địa chỉ
    const { error } = await supabase
      .from("addresses")
      .update({
        recipient_name: data.recipient_name,
        recipient_phone: data.recipient_phone,
        province_city: data.province_city,
        district: data.district,
        ward: data.ward,
        street_address: data.street_address,
        is_default: data.is_default,
        updated_at: new Date().toISOString(),
      })
      .eq("id", addressId)

    if (error) {
      console.error("Error updating address:", error)
      return { success: false, error: "Không thể cập nhật địa chỉ" }
    }

    // Nếu đây là địa chỉ mặc định, cập nhật profile
    if (data.is_default) {
      await supabase.from("profiles").update({ default_address_id: addressId }).eq("id", session.user.id)
    }

    revalidatePath("/tai-khoan/dia-chi")
    return { success: true }
  } catch (error) {
    console.error("Error in updateAddress:", error)
    return { success: false, error: "Đã xảy ra lỗi khi cập nhật địa chỉ" }
  }
}

export async function deleteAddress(addressId: number) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" }
    }

    const supabase = createServerSupabaseClient()

    // Kiểm tra xem địa chỉ có thuộc về người dùng không
    const { data: address, error: checkError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .eq("user_id", session.user.id)
      .single()

    if (checkError || !address) {
      return { success: false, error: "Không tìm thấy địa chỉ hoặc bạn không có quyền xóa" }
    }

    // Kiểm tra xem đây có phải là địa chỉ mặc định không
    const isDefault = address.is_default

    // Xóa địa chỉ
    const { error } = await supabase.from("addresses").delete().eq("id", addressId)

    if (error) {
      console.error("Error deleting address:", error)
      return { success: false, error: "Không thể xóa địa chỉ" }
    }

    // Nếu đây là địa chỉ mặc định, cập nhật profile
    if (isDefault) {
      // Tìm địa chỉ khác để đặt làm mặc định
      const { data: otherAddresses } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (otherAddresses && otherAddresses.length > 0) {
        // Đặt địa chỉ khác làm mặc định
        await supabase.from("addresses").update({ is_default: true }).eq("id", otherAddresses[0].id)

        await supabase.from("profiles").update({ default_address_id: otherAddresses[0].id }).eq("id", session.user.id)
      } else {
        // Không còn địa chỉ nào, đặt default_address_id thành null
        await supabase.from("profiles").update({ default_address_id: null }).eq("id", session.user.id)
      }
    }

    revalidatePath("/tai-khoan/dia-chi")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteAddress:", error)
    return { success: false, error: "Đã xảy ra lỗi khi xóa địa chỉ" }
  }
}

export async function setDefaultAddress(addressId: number) {
  try {
    const session = await getSession()
    if (!session) {
      return { success: false, error: "Bạn cần đăng nhập để thực hiện thao tác này" }
    }

    const supabase = createServerSupabaseClient()

    // Kiểm tra xem địa chỉ có thuộc về người dùng không
    const { data: address, error: checkError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", addressId)
      .eq("user_id", session.user.id)
      .single()

    if (checkError || !address) {
      return { success: false, error: "Không tìm thấy địa chỉ hoặc bạn không có quyền chỉnh sửa" }
    }

    // Cập nhật tất cả các địa chỉ thành không mặc định
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", session.user.id)

    // Đặt địa chỉ này làm mặc định
    await supabase.from("addresses").update({ is_default: true }).eq("id", addressId)

    // Cập nhật profile
    await supabase.from("profiles").update({ default_address_id: addressId }).eq("id", session.user.id)

    revalidatePath("/tai-khoan/dia-chi")
    return { success: true }
  } catch (error) {
    console.error("Error in setDefaultAddress:", error)
    return { success: false, error: "Đã xảy ra lỗi khi đặt địa chỉ mặc định" }
  }
}

