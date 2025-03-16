"use client"

import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import { Star, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  {
    id: 5,
    name: "Cửa hàng 5",
    rating: 5.0,
    reviews: 880,
    image: "/placeholder.svg?height=48&width=48",
  },
]

const benefits = [
  {
    id: 1,
    icon: "shield",
    title: "Thuốc chính hãng",
    description: "Đa dạng và chuyên sâu",
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
    <div className="space-y-8 sm:space-y-12">
      {/* Trusted Stores Section */}
      <section className="rounded-2xl bg-gradient-3 p-3 sm:p-4 md:p-6" aria-labelledby="trusted-stores-heading">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="flex flex-col justify-between gap-2 sm:gap-3">
            <h2 id="trusted-stores-heading" className="text-xl sm:text-2xl md:text-3xl font-semibold text-white">
              Các cửa hàng uy tín của Elela
            </h2>
            <p className="text-sm sm:text-base text-grayscale-5">
              Tổng hợp các cửa hàng được người dùng tin dùng và đánh giá cao
            </p>
          </div>
          <Button
            variant="link"
            className="hidden sm:flex rounded-full bg-white items-center gap-1 text-primary text-sm font-normal decoration-transparent hover:bg-white/90"
            aria-label="Xem tất cả cửa hàng"
          >
            Xem tất cả
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={8}
          slidesPerView={1}
          breakpoints={{
            480: {
              slidesPerView: 1,
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
              <article className="flex items-center gap-3 sm:gap-4 rounded-xl bg-white p-3 sm:p-4">
                <Image
                  src={store.image || "/placeholder.svg"}
                  alt={store.name}
                  width={48}
                  height={48}
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-[48px] md:w-[48px]"
                />
                <div>
                  <h3 className="font-medium text-base sm:text-lg md:text-xl text-grayscale-90">{store.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-warning-5 text-warning-5" aria-hidden="true" />
                    <span className="text-sm font-normal text-grayscale-90">{store.rating}</span>
                    <span className="font-normal text-xs sm:text-sm text-grayscale-40">({store.reviews} đánh giá)</span>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Mobile View All Button */}
        <div className="mt-4 flex sm:hidden justify-center">
          <Button
            variant="link"
            className="decoration-transparent flex rounded-full bg-white items-center gap-1 text-primary hover:bg-white/90 text-xs font-normal px-3 py-1"
            aria-label="Xem tất cả cửa hàng"
          >
            Xem tất cả
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section aria-label="Lợi ích khi mua hàng">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <li key={benefit.id} className="flex items-center gap-3 sm:gap-4">
              <div className="rounded-full bg-primary-5/10 p-2 sm:p-3">
                <Image
                  src={`/placeholder.svg?height=24&width=24`}
                  alt=""
                  width={24}
                  height={24}
                  className="text-primary-40 h-5 w-5 sm:h-6 sm:w-6 md:h-[24px] md:w-[24px]"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h3 className="font-medium text-sm sm:text-base text-grayscale-90">{benefit.title}</h3>
                <p className="text-xs sm:text-sm text-grayscale-50">{benefit.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

