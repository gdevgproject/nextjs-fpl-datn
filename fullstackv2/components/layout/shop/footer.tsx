interface FooterProps {
  shopSettings: {
    shop_name: string
    shop_logo_url: string | null
    contact_email: string | null
    contact_phone: string | null
    address: string | null
    facebook_url: string | null
    messenger_url: string | null
    zalo_url: string | null
    instagram_url: string | null
    tiktok_url: string | null
    youtube_url: string | null
    refund_policy_text: string | null
    shipping_policy_text: string | null
    privacy_policy_text: string | null
    terms_conditions_text: string | null
  } | null
  categories: Array<{
    id: number
    name: string
    slug: string
    parent_category_id: number | null
  }> | null
}

import Link from "next/link"
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function Footer({ shopSettings, categories }: FooterProps) {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">{shopSettings?.shop_name || "MyBeauty"}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Chuyên cung cấp các sản phẩm nước hoa chính hãng với giá tốt nhất thị trường.
            </p>
            <div className="flex space-x-4">
              {shopSettings?.facebook_url && (
                <Link href={shopSettings.facebook_url} className="text-muted-foreground hover:text-primary">
                  <Facebook size={20} />
                </Link>
              )}
              {shopSettings?.instagram_url && (
                <Link href={shopSettings.instagram_url} className="text-muted-foreground hover:text-primary">
                  <Instagram size={20} />
                </Link>
              )}
              {shopSettings?.zalo_url && (
                <Link href={shopSettings.zalo_url} className="text-muted-foreground hover:text-primary">
                  {/* Replace with Zalo icon if available */}
                  <span>Zalo</span>
                </Link>
              )}
              {shopSettings?.tiktok_url && (
                <Link href={shopSettings.tiktok_url} className="text-muted-foreground hover:text-primary">
                  {/* Replace with TikTok icon if available */}
                  <span>TikTok</span>
                </Link>
              )}
              {shopSettings?.youtube_url && (
                <Link href={shopSettings?.youtube_url} className="text-muted-foreground hover:text-primary">
                  <Youtube size={20} />
                </Link>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Danh mục</h3>
            <ul className="space-y-2">
              {categories?.map((category) => (
                <li key={category.id}>
                  <Link href={category.slug} className="text-sm text-muted-foreground hover:text-primary">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/gioi-thieu" className="text-sm text-muted-foreground hover:text-primary">
                  Giới thiệu
                </Link>
              </li>
              {shopSettings?.shipping_policy_text && (
                <li>
                  <Link href="/chinh-sach-van-chuyen" className="text-sm text-muted-foreground hover:text-primary">
                    Chính sách vận chuyển
                  </Link>
                </li>
              )}
              {shopSettings?.refund_policy_text && (
                <li>
                  <Link href="/chinh-sach-doi-tra" className="text-sm text-muted-foreground hover:text-primary">
                    Chính sách đổi trả
                  </Link>
                </li>
              )}
              {shopSettings?.terms_conditions_text && (
                <li>
                  <Link href="/dieu-khoan-dich-vu" className="text-sm text-muted-foreground hover:text-primary">
                    Điều khoản dịch vụ
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{shopSettings?.address || "P.Dương Lâm, Văn Quán, Hà Đông, TP.Hà Nội"}</span>
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Phone className="mr-2 h-4 w-4" />
                <span>{shopSettings?.contact_phone || "0363625119"}</span>
              </li>
              <li className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                <span>{shopSettings?.contact_email || "vuducminh366@gmail.com"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MyBeauty. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  )
}

// Mock Youtube Icon
function Youtube(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-youtube"
      {...props}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v10a24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2H4.5a2 2 0 0 1-2-2z" />
      <path d="m9 12 6 4-6 4V12z" />
    </svg>
  )
}
