import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { AddressForm } from "@/components/tai-khoan/address-form"
import { createServerSupabaseClient } from "@/lib/supabase/supabase-server"
import { getSession } from "@/lib/supabase/supabase-server"

export const metadata: Metadata = {
  title: "Chỉnh sửa địa chỉ - MyBeauty",
  description: "Chỉnh sửa địa chỉ giao hàng",
}

export default async function EditAddressPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) {
    redirect("/dang-nhap?callbackUrl=/tai-khoan/dia-chi")
  }

  const addressId = Number.parseInt(params.id)
  if (isNaN(addressId)) {
    notFound()
  }

  const supabase = createServerSupabaseClient()

  // Lấy thông tin địa chỉ
  const { data: address, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", addressId)
    .eq("user_id", session.user.id)
    .single()

  if (error || !address) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Chỉnh sửa địa chỉ</h3>
        <p className="text-sm text-muted-foreground">Cập nhật thông tin địa chỉ giao hàng</p>
      </div>

      <AddressForm address={address} />
    </div>
  )
}

