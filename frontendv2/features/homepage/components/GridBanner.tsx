"use client"

import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

const leftSlides = [
  {
    id: 1,
    image:
      "https://cdn.nhathuoclongchau.com.vn/unsafe/828x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/Vitabiotic_totchomebaut2_Homepage_PC_1610x492_db075dc88c.jpg",
    alt: "Pharmaton Kiddi promotion 20% off",
  },
  {
    id: 2,
    image:
      "https://cdn.nhathuoclongchau.com.vn/unsafe/828x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/Banner_Web_PC_1610x492_5d06ac70b8.png",
    alt: "Pharmaton Kiddi promotion special offer",
  },
]

export default function GridBanner() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-5">
        {/* Left Side - Sliding Banner */}
        <div className="relative rounded-lg overflow-hidden md:col-span-3 shadow-08 group h-full">
          <Swiper
            loop
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            navigation={{
              prevEl: ".swiper-button-prev",
              nextEl: ".swiper-button-next",
            }}
            className="h-full"
            modules={[Navigation, Pagination, Autoplay]}
            pagination={{
              clickable: true,
              bulletActiveClass: "bg-primary opacity-100",
              bulletClass:
                "inline-block w-2 h-2 rounded-full bg-grayscale-30 opacity-70 mx-1 cursor-pointer transition-all",
            }}
          >
            {leftSlides.map((slide) => (
              <SwiperSlide key={slide.id} className="h-full">
                <div className="relative h-full">
                  <Image
                    fill
                    priority
                    alt={slide.alt}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    src={slide.image || "/placeholder.svg"}
                  />
                </div>
              </SwiperSlide>
            ))}
            {/* Custom Navigation Buttons - Refined positioning and styling */}
            <button
              className="swiper-button-prev !hidden group-hover:!flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/40 items-center justify-center transition-all hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-8 h-8 text-white stroke-[1.5]" />
            </button>
            <button
              className="swiper-button-next !hidden group-hover:!flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/40 items-center justify-center transition-all hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent"
              aria-label="Next slide"
            >
              <ChevronRight className="w-8 h-8 text-white stroke-[1.5]" />
            </button>
          </Swiper>
        </div>

        {/* Right Side - Static Grid */}
        <div className="hidden md:flex md:col-span-2 flex-col gap-4">
          {/* Top image - Fixed height container */}
          <div className="relative w-full h-[140px] rounded-lg overflow-hidden shadow-08">
            <Image
              alt="Top right image"
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              src="https://cdn.nhathuoclongchau.com.vn/unsafe/425x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/399x117_1_3d5f4d9c5d.png"
            />
          </div>

          {/* Bottom image - Fixed height container */}
          <div className="relative w-full h-[140px] rounded-lg overflow-hidden shadow-08">
            <Image
              alt="Bottom right image"
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              src="https://cdn.nhathuoclongchau.com.vn/unsafe/425x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/PC_3d7805381e.png"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

