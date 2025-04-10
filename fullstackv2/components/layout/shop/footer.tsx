import Link from "next/link";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">MyBeauty</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Chuyên cung cấp các sản phẩm nước hoa chính hãng với giá tốt nhất
              thị trường.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook size={20} />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram size={20} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Danh mục</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/san-pham?gender=1"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Nước hoa nam
                </Link>
              </li>
              <li>
                <Link
                  href="/san-pham?gender=2"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Nước hoa nữ
                </Link>
              </li>
              <li>
                <Link
                  href="/san-pham?gender=3"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Unisex
                </Link>
              </li>
              <li>
                <Link
                  href="/danh-muc"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Tất cả danh mục
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/gioi-thieu"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach-van-chuyen"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach-doi-tra"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link
                  href="/dieu-khoan-dich-vu"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                <span>P.Dương Lâm, Văn Quán, Hà Đông, TP.Hà Nội</span>
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Phone className="mr-2 h-4 w-4" />
                <span>0363625119</span>
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                <span>vuducminh366@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MyBeauty. Tất cả các quyền được bảo
            lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
