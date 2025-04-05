"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Youtube,
  TwitterIcon as TikTok,
} from "lucide-react";
import { useShopSettings } from "@/features/shared/hooks/use-shop-settings";
import { Skeleton } from "@/components/ui/skeleton";

export function Footer() {
  const { settings, isLoading } = useShopSettings();

  // Fallback values if settings are not loaded yet
  const shopName = settings?.shop_name || "MyBeauty";
  const address = settings?.address || "123 Đường ABC, Quận 1, TP.HCM";
  const email = settings?.contact_email || "info@mybeauty.vn";
  const phone = settings?.contact_phone || "0123 456 789";
  const facebookUrl = settings?.facebook_url || "";
  const instagramUrl = settings?.instagram_url || "";
  const tiktokUrl = settings?.tiktok_url || "";
  const youtubeUrl = settings?.youtube_url || "";
  const messengerUrl = settings?.messenger_url || "";
  const zaloUrl = settings?.zalo_url || "";

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-lg overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt={`${shopName} Logo`}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </div>
              <span className="font-bold text-xl">
                {isLoading ? <Skeleton className="h-6 w-24" /> : shopName}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Cửa hàng nước hoa chính hãng với đa dạng thương hiệu cao cấp
            </p>
            <div className="mt-4 flex space-x-3">
              {facebookUrl && (
                <Link
                  href={facebookUrl}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
              )}
              {instagramUrl && (
                <Link
                  href={instagramUrl}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              )}
              {tiktokUrl && (
                <Link
                  href={tiktokUrl}
                  className="text-muted-foreground hover:text-primary"
                >
                  <TikTok className="h-5 w-5" />
                  <span className="sr-only">TikTok</span>
                </Link>
              )}
              {youtubeUrl && (
                <Link
                  href={youtubeUrl}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Youtube className="h-5 w-5" />
                  <span className="sr-only">Youtube</span>
                </Link>
              )}
              {messengerUrl && (
                <Link
                  href={messengerUrl}
                  className="text-muted-foreground hover:text-primary"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="sr-only">Messenger</span>
                </Link>
              )}
              {zaloUrl && (
                <Link
                  href={zaloUrl}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Phone className="h-5 w-5" />
                  <span className="sr-only">Zalo</span>
                </Link>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Thông tin</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link
                  href="/gioi-thieu"
                  className="text-muted-foreground hover:text-primary"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach-bao-mat"
                  className="text-muted-foreground hover:text-primary"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/dieu-khoan-dich-vu"
                  className="text-muted-foreground hover:text-primary"
                >
                  Điều khoản dịch vụ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Hỗ trợ</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link
                  href="/lien-he"
                  className="text-muted-foreground hover:text-primary"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach-doi-tra"
                  className="text-muted-foreground hover:text-primary"
                >
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link
                  href="/cau-hoi-thuong-gap"
                  className="text-muted-foreground hover:text-primary"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Liên hệ</h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  {isLoading ? <Skeleton className="h-4 w-full" /> : address}
                </span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>
                  {isLoading ? <Skeleton className="h-4 w-32" /> : email}
                </span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>
                  {isLoading ? <Skeleton className="h-4 w-24" /> : phone}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {shopName}. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
}
