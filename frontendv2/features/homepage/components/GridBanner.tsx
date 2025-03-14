"use client"

import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

const leftSlides = [
  {
    id: 1,
    image: "/placeholder.svg?height=300&width=600",
    alt: "Pharmaton Kiddi promotion 20% off",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=300&width=600",
    alt: "Pharmaton Kiddi promotion special offer",
  },
  // Add more slides as needed
]

const promotions = [
  {
    id: 1,
    title: "HỖ TRỢ TĂNG CƯỜNG SỨC KHỎE GIÚP XƯƠNG CHẮC KHỎE",
    discount: "20%",
    originalPrice: "169.000đ",
    salePrice: "135.200đ",
    unit: "Hộp",
    productImage: "/placeholder.svg?height=300&width=200",
    buttonText: "MUA NGAY",
  },
  {
    id: 2,
    title: "THỦ CỦ ĐỔI MỚI",
    subPromotions: [
      {
        id: "a",
        text: "XỊT MEN SUYỄN",
        price: "5.000đ",
      },
      {
        id: "b",
        text: "BÚT TIÊM TIỂU ĐƯỜNG",
        price: "15.000đ",
      },
    ],
    mainPromotion: {
      title: "CALCI EXTRA",
      subtitle: "CHO XƯƠNG CHẮC KHỎE MỖI NGÀY",
      discount: "25%",
      image: "/placeholder.svg?height=300&width=400",
    },
  },
]

export default function GridBanner() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Left Side - Sliding Banner */}
      <div className="relative rounded-lg overflow-hidden">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop
          className="aspect-[2/1]"
        >
          {leftSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative h-full w-full">
                <Image src={slide.image || "/placeholder.svg"} alt={slide.alt} fill className="object-cover" />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Right Side - Static Grid */}
      <div className="space-y-4">
        {/* Top Row - Two Boxes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative aspect-[2/1] rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=150&width=300"
              alt="XỊT MEN SUYỄN promotion"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[2/1] rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=150&width=300"
              alt="BÚT TIÊM TIỂU ĐƯỜNG promotion"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Bottom - Full Width Banner */}
        <div className="relative aspect-[2/1] rounded-lg overflow-hidden">
          <Image
            src="/placeholder.svg?height=300&width=600"
            alt="CALCI EXTRA promotion"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  )
}

