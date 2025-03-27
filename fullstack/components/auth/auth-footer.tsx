import Link from "next/link"

export function AuthFooter() {
  return (
    <div className="text-center text-sm text-muted-foreground">
      <div className="flex justify-center space-x-4">
        <Link href="/chinh-sach/dieu-khoan-su-dung" className="hover:text-foreground transition-colors">
          Điều khoản sử dụng
        </Link>
        <Link href="/chinh-sach/bao-mat" className="hover:text-foreground transition-colors">
          Chính sách bảo mật
        </Link>
        <Link href="/lien-he" className="hover:text-foreground transition-colors">
          Liên hệ
        </Link>
      </div>
      <div className="mt-2">&copy; {new Date().getFullYear()} MyBeauty. Tất cả quyền được bảo lưu.</div>
    </div>
  )
}

