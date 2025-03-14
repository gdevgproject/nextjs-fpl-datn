"use client"

import { Button } from "@/components/ui/Button"
import { ChevronRight, Flame } from "lucide-react"
import Image from "next/image"
import { Grid, Navigation } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/grid"
import "swiper/css/navigation"

const deals = [
  {
    id: 1,
    image: "/placeholder.svg?height=200&width=200",
    name: "Hỗn hợp Vitamin D3 King Phar bổ sung Canxi, giúp xương chắc khỏe",
    originalPrice: "200.000đ",
    salePrice: "100.000đ",
    unit: "Hộp",
    discount: "-50%",
    isBestSeller: true,
    soldProgress: 75, // percentage of stock sold
  },
  {
    id: 2,
    image: "/placeholder.svg?height=200&width=200",
    name: "Hỗn hợp Vitamin D3 King Phar bổ sung Canxi, giúp xương chắc khỏe",
    originalPrice: "200.000đ",
    salePrice: "100.000đ",
    unit: "Hộp",
    discount: "-50%",
    isBestSeller: true,
    soldProgress: 85,
  },
  // Add more deals as needed
]

export default function DealSlider() {
  return (
    <section className="rounded-lg bg-primary-5 p-3 sm:p-4" aria-labelledby="deals-heading">
      <header className="mb-3 sm:mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <h2
            id="deals-heading"
            className="flex items-center gap-1 sm:gap-2 text-lg sm:text-xl font-bold text-white"
          >
            Săn
            <span className="text-warning-5">⚡</span>
            Deal
          </h2>
          <div
            className="flex gap-1 sm:gap-2 text-white text-xs sm:text-sm"
            aria-label="Thời gian còn lại"
          >
            <span className="rounded bg-primary-20 px-1 sm:px-2 py-0.5 sm:py-1">24</span>
            <span>:</span>
            <span className="rounded bg-primary-20 px-1 sm:px-2 py-0.5 sm:py-1">12</span>
            <span>:</span>
            <span className="rounded bg-primary-20 px-1 sm:px-2 py-0.5 sm:py-1">10</span>
          </div>
        </div>
        <Button
          variant="link"
          className="flex items-center gap-1 text-white hover:text-white/90 text-xs sm:text-sm p-0 sm:p-2"
          aria-label="Xem thêm sản phẩm khuyến mãi"
        >
          Xem thêm
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
        </Button>
      </header>

      <Swiper
        modules={[Navigation, Grid]}
        navigation
        grid={{
          rows: 1,
          fill: "row",
        }}
        spaceBetween={8}
        slidesPerView={1.2}
        breakpoints={{
          320: {
            slidesPerView: 1.5,
            spaceBetween: 8,
          },
          480: {
            slidesPerView: 2,
            spaceBetween: 12,
          },
          640: {
            slidesPerView: 2.5,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 16,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 16,
          },
          1280: {
            slidesPerView: 5,
            spaceBetween: 16,
          },
        }}
        className="deal-slider"
        aria-label="Sản phẩm khuyến mãi"
      >
        {deals.map((deal) => (
          <SwiperSlide key={deal.id}>
            <article className="rounded-lg bg-white p-2 sm:p-4">
              {/* Product Image with Discount Tag */}
              <figure className="relative mb-2 sm:mb-4 aspect-square">
                <Image
                  src={deal.image || "/placeholder.svg"}
                  alt={deal.name}
                  fill
                  className="object-contain"
                />
                <span className="absolute left-1 top-1 sm:left-2 sm:top-2 rounded bg-error-5 px-1 py-0.5 sm:px-2 sm:py-1 text-xs font-bold text-white">
                  {deal.discount}
                </span>
              </figure>

              {/* Product Info */}
              <h3 className="mb-1 sm:mb-2 line-clamp-2 min-h-[2.5rem] text-xs sm:text-sm font-medium text-grayscale-90">
                {deal.name}
              </h3>

              {/* Price Info */}
              <div className="mb-1 sm:mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-base sm:text-lg font-bold text-primary-5">
                    {deal.salePrice}
                  </span>
                  <span className="text-xs sm:text-sm text-grayscale-50">/{deal.unit}</span>
                </div>
                <p className="text-xs sm:text-sm text-grayscale-40 line-through">
                  {deal.originalPrice}
                </p>
              </div>

              {/* Best Seller Badge with Progress */}
              {deal.isBestSeller && (
                <div className="mb-2 sm:mb-3 space-y-1">
                  <div className="flex items-center gap-1 text-xs text-error-5">
                    <Flame className="h-3 w-3 sm:h-4 sm:w-4 fill-error-5" aria-hidden="true" />
                    <span>Đang bán chạy</span>
                  </div>
                  <div className="h-1 sm:h-1.5 w-full overflow-hidden rounded-full bg-error-5/10">
                    <div
                      className="h-full rounded-full bg-error-5 transition-all duration-500"
                      style={{ width: `${deal.soldProgress}%` }}
                      aria-label={`Đã bán ${deal.soldProgress}%`}
                      role="progressbar"
                      aria-valuenow={deal.soldProgress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              )}

              {/* Buy Button */}
              <Button className="w-full bg-primary-5 text-white hover:bg-primary-20 text-xs sm:text-sm py-1 sm:py-2 h-auto">
                Chọn Mua
              </Button>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
