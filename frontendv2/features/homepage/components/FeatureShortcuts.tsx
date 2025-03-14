"use client"

import Link from "next/link"
import { ShoppingBag, Stethoscope, MapPin, FileText, Activity, Ruler } from "lucide-react"
import { useEffect, useRef } from "react"

const features = [
  {
    id: 1,
    icon: ShoppingBag,
    label: "Cần mua sản phẩm",
    href: "/products",
  },
  {
    id: 2,
    icon: Stethoscope,
    label: "Tư vấn với Coach",
    href: "/coach",
  },
  {
    id: 3,
    icon: MapPin,
    label: "Tìm cửa hàng uy tín",
    href: "/trusted-shops",
  },
  {
    id: 4,
    icon: FileText,
    label: "Đơn thuốc của tôi",
    href: "/prescriptions",
  },
  {
    id: 5,
    icon: Activity,
    label: "Kiểm tra dinh dưỡng",
    href: "/nutrition-check",
  },
  {
    id: 6,
    icon: Ruler,
    label: "Đo cao",
    href: "/height-measurement",
  },
]

export default function FeatureShortcuts() {
  const scrollRef = useRef<HTMLUListElement>(null)

  // Add horizontal scroll with touch/mouse for mobile
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth < 768) {
        e.preventDefault()
        scrollContainer.scrollLeft += e.deltaY
      }
    }

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false })
    return () => scrollContainer.removeEventListener("wheel", handleWheel)
  }, [])

  return (
    <nav className="py-4" aria-label="Truy cập nhanh">
      <ul
        ref={scrollRef}
        className="flex w-full space-x-2 overflow-x-auto pb-2 scrollbar-hide md:justify-between md:space-x-0 md:overflow-visible"
      >
        {features.map((feature) => (
          <li key={feature.id} className="flex-shrink-0">
            <Link
              href={feature.href}
              className="flex min-w-[80px] sm:min-w-[100px] flex-col items-center gap-2 rounded-lg px-2 sm:px-3 py-2 sm:py-3 transition-colors hover:bg-primary-5/5 md:min-w-[120px] md:px-4"
            >
              <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-40" aria-hidden="true" />
              <span className="text-center text-xs sm:text-sm font-medium text-grayscale-70">{feature.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

