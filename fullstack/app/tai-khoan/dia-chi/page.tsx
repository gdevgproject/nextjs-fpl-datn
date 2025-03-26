import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddressList } from "@/components/tai-khoan/address-list"
import { createServerSupabaseClient } from "@/lib/supabase/supabase-server"
import { getSession } from "@/lib/supabase/supabase-server"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Địa chỉ của tôi - MyBeauty",
  description: "Quản lý địa chỉ giao hàng của bạn",
}

export default async function AddressPage() {
  const session = await getSession()
  if (!session) {
    redirect("/dang-nhap?callbackUrl=/tai-khoan/dia-chi")
  }

  const supabase = createServerSupabaseClient()

  // Lấy danh sách địa chỉ của người dùng
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", session.user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  // Lấy thông tin profile để biết địa chỉ mặc định
  const { data: profile } = await supabase
    .from("profiles")
    .select("default_address_id")
    .eq("id", session.user.id)
    .single()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Địa chỉ của tôi</h3>
          <p className="text-sm text-muted-foreground">Quản lý địa chỉ giao hàng của bạn</p>
        </div>
        <Button asChild>
          <Link href="/tai-khoan/dia-chi/them">
            <Plus className="mr-2 h-4 w-4" />
            Thêm địa chỉ mới
          </Link>
        </Button>
      </div>

      <AddressList addresses={addresses || []} defaultAddressId={profile?.default_address_id} />
    </div>
  )
}

