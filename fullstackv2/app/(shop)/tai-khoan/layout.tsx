import type React from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { UserCircle, ShoppingBag, Heart, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Tài khoản",
  description: "Quản lý tài khoản của bạn",
}

interface AccountLayoutProps {
  children: React.ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4">
          <nav className="space-y-2">
            <Link href="/tai-khoan/thong-tin" className="flex items-center gap-2 p-3 rounded-md hover:bg-accent">
              <UserCircle className="h-5 w-5" />
              <span>Thông tin tài khoản</span>
            </Link>
            <Link href="/tai-khoan/don-hang" className="flex items-center gap-2 p-3 rounded-md hover:bg-accent">
              <ShoppingBag className="h-5 w-5" />
              <span>Đơn hàng của tôi</span>
            </Link>
            <Link href="/tai-khoan/yeu-thich" className="flex items-center gap-2 p-3 rounded-md hover:bg-accent">
              <Heart className="h-5 w-5" />
              <span>Danh sách yêu thích</span>
            </Link>
            <Link href="/tai-khoan/dia-chi" className="flex items-center gap-2 p-3 rounded-md hover:bg-accent">
              <MapPin className="h-5 w-5" />
              <span>Địa chỉ của tôi</span>
            </Link>
          </nav>
        </aside>
        <main className="w-full md:w-3/4">{children}</main>
      </div>
    </div>
  )
}
