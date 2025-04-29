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
  ChevronUp,
} from "lucide-react";
import type { ShopSettings } from "@/lib/types/shared.types";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Memoized footer section component to prevent unnecessary re-renders
const FooterSection = memo(function FooterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold relative inline-block">
        {title}
        <span className="absolute -bottom-1 left-0 h-0.5 w-12 bg-primary/70"></span>
      </h3>
      <div className="space-y-3 text-sm">{children}</div>
    </div>
  );
});

// Memoized social link component with enhanced hover effects
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
      className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:scale-110 transform inline-flex items-center justify-center w-9 h-9 rounded-full bg-muted/40 hover:bg-primary/10"
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </Link>
  );
});

/**
 * Footer component optimized for performance
 * Uses memoization and conditional rendering to minimize re-renders
 * Follows the dev-guide.txt recommendations for client components
 */
export const Footer = memo(function Footer({
  initialSettings,
  loadingSettings,
}: {
  initialSettings?: ShopSettings;
  loadingSettings?: boolean;
}) {
  // Use server-provided settings if available, else fetch on client
  const { settings: fetchedSettings, isLoading: fetchedLoading } =
    useShopSettings(initialSettings);
  const settings = initialSettings ?? fetchedSettings;
  // Choose loading flag based on SSR prop
  const isLoading =
    initialSettings !== undefined ? !!loadingSettings : fetchedLoading;

  // Fallback values if settings are not loaded yet
  const logoUrl = settings?.shop_logo_url || "/placeholder-logo.png";
  const shopName = settings?.shop_name || "MyBeauty";
  const address = settings?.address || "Địa chỉ đang cập nhật";
  const email = settings?.contact_email || "info@mybeauty.vn";
  const phone = settings?.contact_phone || "0123 456 789";

  // Social media URLs
  const facebookUrl = settings?.facebook_url || "";
  const instagramUrl = settings?.instagram_url || "";
  const youtubeUrl = settings?.youtube_url || "";
  const messengerUrl = settings?.messenger_url || "";
  const zaloUrl = settings?.zalo_url || "";

  // Policy content flags - Check if these fields exist in shop_settings based on schema.txt
  const hasRefundPolicy = !!settings?.refund_policy_text;
  const hasShippingPolicy = !!settings?.shipping_policy_text;
  const hasPrivacyPolicy = !!settings?.privacy_policy_text;
  const hasTerms = !!settings?.terms_conditions_text;

  // Year for copyright
  const currentYear = new Date().getFullYear();

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="border-t bg-background/90 backdrop-blur-sm">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {/* Company Info Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 group">
              <div className="rounded-lg overflow-hidden shadow-sm transition-transform duration-300 group-hover:shadow-md">
                <Image
                  src={logoUrl}
                  alt={`${shopName} Logo`}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="space-y-1">
                <span className="font-bold text-xl text-primary">
                  {isLoading ? <Skeleton className="h-7 w-32" /> : shopName}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {isLoading ? (
                    <Skeleton className="h-4 w-40" />
                  ) : (
                    "Nước hoa chính hãng"
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {shopName
                  ? `Cửa hàng ${shopName} - Chuyên cung cấp nước hoa chính hãng từ các thương hiệu cao cấp trên toàn thế giới.`
                  : "Cửa hàng nước hoa chính hãng với đa dạng thương hiệu cao cấp, mang đến trải nghiệm mua sắm tuyệt vời cho khách hàng."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <SocialLink href={facebookUrl} icon={Facebook} label="Facebook" />
              <SocialLink
                href={instagramUrl}
                icon={Instagram}
                label="Instagram"
              />
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
            <ScrollArea className="h-48 pr-4 -mr-4">
              <ul className="space-y-3">
                <li>
                  <FooterLink href="/gioi-thieu">Giới thiệu</FooterLink>
                </li>
                {hasPrivacyPolicy && (
                  <li>
                    <FooterLink href="/chinh-sach-bao-mat">
                      Chính sách bảo mật
                    </FooterLink>
                  </li>
                )}
                {hasTerms && (
                  <li>
                    <FooterLink href="/dieu-khoan-dich-vu">
                      Điều khoản dịch vụ
                    </FooterLink>
                  </li>
                )}
                <li>
                  <FooterLink href="/thanh-toan">
                    Phương thức thanh toán
                  </FooterLink>
                </li>
              </ul>
            </ScrollArea>
          </FooterSection>

          {/* Contact Section */}
          <FooterSection title="Liên hệ">
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground group">
                <div className="mt-0.5 flex-shrink-0 rounded-full p-1.5 bg-muted/50 group-hover:bg-primary/10 transition-colors">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-primary/70" />
                </div>
                <span className="text-sm leading-tight group-hover:text-primary/90 transition-colors">
                  {isLoading ? (
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  ) : (
                    address
                  )}
                </span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground group">
                <div className="flex-shrink-0 rounded-full p-1.5 bg-muted/50 group-hover:bg-primary/10 transition-colors">
                  <Mail className="h-4 w-4 flex-shrink-0 text-primary/70" />
                </div>
                <span className="text-sm leading-tight group-hover:text-primary/90 transition-colors">
                  {isLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    <Link href={`mailto:${email}`} className="hover:underline">
                      {email}
                    </Link>
                  )}
                </span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground group">
                <div className="flex-shrink-0 rounded-full p-1.5 bg-muted/50 group-hover:bg-primary/10 transition-colors">
                  <Phone className="h-4 w-4 flex-shrink-0 text-primary/70" />
                </div>
                <span className="text-sm leading-tight group-hover:text-primary/90 transition-colors">
                  {isLoading ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <Link
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="hover:underline"
                    >
                      {phone}
                    </Link>
                  )}
                </span>
              </li>
            </ul>

            {/* Support links */}
            <div className="pt-4 space-y-3">
              {hasRefundPolicy && (
                <FooterLink href="/chinh-sach-doi-tra">
                  Chính sách đổi trả
                </FooterLink>
              )}
              {hasShippingPolicy && (
                <FooterLink href="/chinh-sach-van-chuyen">
                  Chính sách vận chuyển
                </FooterLink>
              )}
            </div>
          </FooterSection>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 pt-6 border-t border-border/30 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {shopName}. Tất cả quyền được bảo lưu.
          </p>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToTop}
            className="rounded-full h-9 w-9 border-border/60 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300"
          >
            <ChevronUp className="h-4 w-4" />
            <span className="sr-only">Lên đầu trang</span>
          </Button>
        </div>
      </div>
    </footer>
  );
});

// Internal component for footer links with hover effects
function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex gap-1.5 items-center group"
    >
      <span className="group-hover:underline underline-offset-4">
        {children}
      </span>
    </Link>
  );
}
