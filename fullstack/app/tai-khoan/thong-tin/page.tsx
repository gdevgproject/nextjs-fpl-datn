import { ProfileForm } from "@/components/tai-khoan/profile-form"
import { AvatarUpload } from "@/components/tai-khoan/avatar-upload"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  // Dữ liệu mẫu
  const profileData = {
    display_name: "Nguyễn Văn A",
    phone_number: "0912345678",
    email: "example@gmail.com",
    gender: "male",
    birth_date: "1990-01-01",
    avatar_url: "/placeholder.svg?height=100&width=100",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Thông tin cá nhân</h2>
        <p className="text-muted-foreground">Quản lý thông tin cá nhân của bạn</p>
      </div>
      <Separator />
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-4 text-lg font-medium">Ảnh đại diện</h3>
          <AvatarUpload initialImage={profileData.avatar_url} />
        </div>
        <div>
          <h3 className="mb-4 text-lg font-medium">Thông tin cá nhân</h3>
          <ProfileForm initialData={profileData} />
        </div>
      </div>
    </div>
  )
}

