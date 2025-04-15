"use client";

import { memo } from "react";
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
  TikTok,
} from "lucide-react";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import { Skeleton } from "@/components/ui/skeleton";

// Memoized footer section component to prevent unnecessary re-renders
const FooterSection = memo(function FooterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-2 space-y-2 text-sm">{children}</div>
    </div>
  );
});

// Memoized social link component
const SocialLink = memo(function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  if (!href) return null;

  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-primary"
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon className="h-5 w-5" />
      <span className="sr-only">{label}</span>
    </Link>
  );
});

/**
 * Footer component optimized for performance
 * Uses memoization and conditional rendering to minimize re-renders
 * Follows the dev-guide.txt recommendations for client components
 */
export const Footer = memo(function Footer() {
  const { settings, isLoading } = useShopSettings();

  // Fallback values if settings are not loaded yet
  const logoUrl = settings?.shop_logo_url || "/placeholder-logo.png";
  const shopName = settings?.shop_name || "MyBeauty";
  const address = settings?.address || "Địa chỉ đang cập nhật";
  const email = settings?.contact_email || "info@mybeauty.vn";
  const phone = settings?.contact_phone || "0123 456 789";

  // Social media URLs
  const facebookUrl = settings?.facebook_url || "";
  const instagramUrl = settings?.instagram_url || "";
  const tiktokUrl = settings?.tiktok_url || "";
  const youtubeUrl = settings?.youtube_url || "";
  const messengerUrl = settings?.messenger_url || "";
  const zaloUrl = settings?.zalo_url || "";

  // Policy content flags
  const hasRefundPolicy = !!settings?.refund_policy_text;
  const hasShippingPolicy = !!settings?.shipping_policy_text;
  const hasPrivacyPolicy = !!settings?.privacy_policy_text;
  const hasTerms = !!settings?.terms_conditions_text;

  // Year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-lg overflow-hidden">
                <Image
                  src={logoUrl}
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
              {shopName
                ? `Cửa hàng ${shopName} - ${address}`
                : "Cửa hàng nước hoa chính hãng với đa dạng thương hiệu cao cấp"}
            </p>
            <div className="mt-4 flex space-x-3">
              <SocialLink href={facebookUrl} icon={Facebook} label="Facebook" />
              <SocialLink
                href={instagramUrl}
                icon={Instagram}
                label="Instagram"
              />
              <SocialLink href={tiktokUrl} icon={TikTok} label="TikTok" />
              <SocialLink href={youtubeUrl} icon={Youtube} label="Youtube" />
              <SocialLink
                href={messengerUrl}
                icon={MessageSquare}
                label="Messenger"
              />
              <SocialLink href={zaloUrl} icon={Phone} label="Zalo" />
            </div>
          </div>

          {/* Information Section */}
          <FooterSection title="Thông tin">
            <ul>
              <li>
                <Link
                  href="/gioi-thieu"
                  className="text-muted-foreground hover:text-primary"
                >
                  Giới thiệu
                </Link>
              </li>
              {hasPrivacyPolicy && (
                <li>
                  <Link
                    href="/chinh-sach-bao-mat"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Chính sách bảo mật
                  </Link>
                </li>
              )}
              {hasTerms && (
                <li>
                  <Link
                    href="/dieu-khoan-dich-vu"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Điều khoản dịch vụ
                  </Link>
                </li>
              )}
            </ul>
          </FooterSection>

          {/* Support Section */}
          <FooterSection title="Hỗ trợ">
            <ul>
              <li>
                <Link
                  href="/lien-he"
                  className="text-muted-foreground hover:text-primary"
                >
                  Liên hệ
                </Link>
              </li>
              {hasRefundPolicy && (
                <li>
                  <Link
                    href="/chinh-sach-doi-tra"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Chính sách đổi trả
                  </Link>
                </li>
              )}
              {hasShippingPolicy && (
                <li>
                  <Link
                    href="/chinh-sach-van-chuyen"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Chính sách vận chuyển
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/cau-hoi-thuong-gap"
                  className="text-muted-foreground hover:text-primary"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </FooterSection>

          {/* Contact Section */}
          <FooterSection title="Liên hệ">
            <ul>
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
          </FooterSection>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {currentYear} {shopName}. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
});
