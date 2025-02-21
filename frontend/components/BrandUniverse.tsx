import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/autoplay"
import type { Brand } from "@/lib/mockData"

interface BrandUniverseProps {
  brands: Brand[]
}

export default function BrandUniverse({ brands }: BrandUniverseProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center font-serif">Prestigious Brands</h2>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={30}
          slidesPerView={2}
          navigation
          autoplay={{ delay: 3000 }}
          breakpoints={{
            640: {
              slidesPerView: 3,
            },
            768: {
              slidesPerView: 4,
            },
            1024: {
              slidesPerView: 6,
            },
          }}
        >
          {brands.map((brand) => (
            <SwiperSlide key={brand.id}>
              <Link href={`/brand/${brand.id}`}>
                <Card className="hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-4 flex flex-col items-center justify-center h-40">
                    <div className="relative w-24 h-24 mb-2 grayscale hover:grayscale-0 transition-all duration-300">
                      <Image
                        src={brand.logo || "/placeholder.svg"}
                        alt={brand.name}
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-center">{brand.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

