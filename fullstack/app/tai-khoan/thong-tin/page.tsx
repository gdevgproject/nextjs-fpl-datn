import type { Metadata } from "next"
import { ProfileForm } from "@/components/tai-khoan/profile-form"
import { getUserDetails } from "@/lib/supabase/supabase-server"

export const metadata: Metadata = {
  title: "Thông tin tài khoản - MyBeauty",
  description: "Xem và cập nhật thông tin tài khoản của bạn",
}

export default async function ProfilePage() {
  const profile = await getUserDetails()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Thông tin tài khoản</h3>
        <p className="text-sm text-muted-foreground">Xem và cập nhật thông tin cá nhân của bạn</p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  )
}

