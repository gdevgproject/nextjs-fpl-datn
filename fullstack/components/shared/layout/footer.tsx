import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image src="/images/logo.png" alt="MyBeauty Logo" width={100} height={33} className="h-8 w-auto" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Cửa hàng nước hoa chính hãng với đa dạng thương hiệu cao cấp
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Thông tin</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/gioi-thieu" className="text-muted-foreground hover:text-primary">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-bao-mat" className="text-muted-foreground hover:text-primary">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/dieu-khoan-dich-vu" className="text-muted-foreground hover:text-primary">
                  Điều khoản dịch vụ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Hỗ trợ</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/lien-he" className="text-muted-foreground hover:text-primary">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-doi-tra" className="text-muted-foreground hover:text-primary">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/cau-hoi-thuong-gap" className="text-muted-foreground hover:text-primary">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Liên hệ</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="text-muted-foreground">Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</li>
              <li className="text-muted-foreground">Email: info@mybeauty.vn</li>
              <li className="text-muted-foreground">Điện thoại: 0123 456 789</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MyBeauty. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}

