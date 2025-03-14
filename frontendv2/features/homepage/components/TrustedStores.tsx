"use client"

import { Button } from "@/components/ui/Button"
import { ChevronRight, Star } from "lucide-react"
import Image from "next/image"
import { Navigation } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"

const stores = [
  {
    id: 1,
    name: "Cửa hàng 1",
    rating: 5.0,
    reviews: 80,
    image: "/placeholder.svg?height=48&width=48",
  },
  {
    id: 2,
    name: "Cửa hàng 2",
    rating: 5.0,
    reviews: 75,
    image: "/placeholder.svg?height=48&width=48",
  },
  {
    id: 3,
    name: "Cửa hàng 3",
    rating: 5.0,
    reviews: 62,
    image: "/placeholder.svg?height=48&width=48",
  },
  {
    id: 4,
    name: "Cửa hàng 4",
    rating: 5.0,
    reviews: 88,
    image: "/placeholder.svg?height=48&width=48",
  },
]

const benefits = [
  {
    id: 1,
    icon: "shield",
    title: "Thuốc chính hãng",
    description: "Đã đăng và chuyên sâu",
  },
  {
    id: 2,
    icon: "refresh",
    title: "Đổi trả trong 30 ngày",
    description: "Kể từ ngày mua hàng",
  },
  {
    id: 3,
    icon: "check-circle",
    title: "Cam kết 100%",
    description: "Chất lượng sản phẩm",
  },
  {
    id: 4,
    icon: "truck",
    title: "Miễn phí vận chuyển",
    description: "Theo chính sách giao hàng",
  },
]

export default function TrustedStores() {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Trusted Stores Section */}
      <section
        className="rounded-lg bg-primary-5 p-3 sm:p-4 md:p-6"
        aria-labelledby="trusted-stores-heading"
      >
        <header className="mb-3 sm:mb-4 md:mb-6">
          <div className="mb-2 sm:mb-3 md:mb-4 flex items-center justify-between">
            <h2 id="trusted-stores-heading" className="text-lg sm:text-xl font-bold text-white">
              Các cửa hàng uy tín của Elela
            </h2>
            <Button
              variant="link"
              className="flex items-center gap-1 text-white hover:text-white/90 text-xs sm:text-sm p-0 sm:p-2"
              aria-label="Xem tất cả cửa hàng"
            >
              Xem tất cả
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-white/80">
            Tổng hợp các cửa hàng được người dùng tin dùng và đánh giá cao
          </p>
        </header>

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={8}
          slidesPerView={1.2}
          breakpoints={{
            320: {
              slidesPerView: 1.2,
              spaceBetween: 8,
            },
            480: {
              slidesPerView: 1.5,
              spaceBetween: 12,
            },
            640: {
              slidesPerView: 2,
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
          }}
          className="trusted-stores-slider"
          aria-label="Danh sách cửa hàng uy tín"
        >
          {stores.map((store) => (
            <SwiperSlide key={store.id}>
              <article className="flex items-center gap-2 sm:gap-4 rounded-lg bg-white p-2 sm:p-4">
                <Image
                  src={store.image || "/placeholder.svg"}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-lg sm:w-[48px] sm:h-[48px]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm sm:text-base font-medium text-grayscale-90">
                    {store.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star
                      className="h-3 w-3 sm:h-4 sm:w-4 fill-warning-5 text-warning-5"
                      aria-hidden="true"
                    />
                    <span className="text-xs sm:text-sm font-medium text-grayscale-90">
                      {store.rating}
                    </span>
                    <span className="text-[10px] sm:text-sm text-grayscale-50">
                      ({store.reviews} đánh giá)
                    </span>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Benefits Section */}
      <section aria-label="Lợi ích khi mua hàng">
        <ul className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <li
              key={benefit.id}
              className="flex items-center gap-2 sm:gap-3 md:gap-4 rounded-lg bg-primary-5/5 p-2 sm:p-3 md:p-4"
            >
              <div className="rounded-full bg-primary-5/10 p-1.5 sm:p-2 md:p-3">
                <Image
                  src={`/placeholder.svg?height=24&width=24`}
                  alt=""
                  width={16}
                  height={16}
                  className="text-primary-40 sm:w-[20px] sm:h-[20px] md:w-6 md:h-6"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm md:text-base font-medium text-grayscale-90">
                  {benefit.title}
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-grayscale-50">
                  {benefit.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
