"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrderConfirmationRedirect({ resultCode }) {
  const router = useRouter();
  useEffect(() => {
    if (resultCode && resultCode !== "0") {
      router.replace("/thanh-toan/that-bai");
    }
  }, [resultCode, router]);
  return null;
}
