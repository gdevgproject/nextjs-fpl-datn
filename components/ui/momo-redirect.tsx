"use client";
import { useEffect } from "react";

interface MomoRedirectProps {
  payUrl: string;
}

export default function MomoRedirect({ payUrl }: MomoRedirectProps) {
  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor;
    const isAndroid = /android/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;

    // Deep link MoMo (nếu payUrl là link web, chuyển thành link app nếu có thể)
    let momoDeepLink = payUrl;
    if (payUrl.startsWith("https://") && payUrl.includes("momo.vn")) {
      // MoMo trả về dạng https://...payUrl=...&... => lấy giá trị payUrl thực sự
      try {
        const urlObj = new URL(payUrl);
        const realPayUrl = urlObj.searchParams.get("payUrl");
        if (realPayUrl && realPayUrl.startsWith("momo://")) {
          momoDeepLink = realPayUrl;
        }
      } catch {}
    }

    let timeout: NodeJS.Timeout;
    if (isAndroid || isIOS) {
      // Thử mở app MoMo
      window.location.href = momoDeepLink;
      // Nếu sau 2s vẫn chưa chuyển app, chuyển sang store
      timeout = setTimeout(() => {
        if (isIOS) {
          window.location.href =
            "https://apps.apple.com/vn/app/momo-chuyen-tien-thanh-toan/id918751511";
        } else if (isAndroid) {
          window.location.href =
            "https://play.google.com/store/apps/details?id=com.mservice.momotransfer";
        }
      }, 2000);
    } else {
      // Desktop: chỉ redirect đến payUrl
      window.location.href = payUrl;
    }
    return () => clearTimeout(timeout);
  }, [payUrl]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px]">
      <p>Đang chuyển hướng đến MoMo...</p>
    </div>
  );
}
