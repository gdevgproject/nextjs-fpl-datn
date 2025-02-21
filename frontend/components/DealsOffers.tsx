import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/autoplay"
import type { Discount } from "@/lib/mockData"

interface DealsOffersProps {
  discounts: Discount[]
}

export default function DealsOffers({ discounts }: DealsOffersProps) {
  const handleUseCode = (code: string) => {
    // Implement logic to use the discount code
    console.log(`Using discount code: ${code}`)
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center font-serif text-primary">Exclusive Offers</h2>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          autoplay={{ delay: 5000 }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
        >
          {discounts.map((discount) => (
            <SwiperSlide key={discount.id}>
              <Card className="bg-gradient-to-r from-purple-400 to-pink-500 text-white overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{discount.discount_code}</h3>
                  <p className="text-4xl font-bold mb-4">{discount.percent}% OFF</p>
                  {discount.minimum_spend && <p className="text-sm mb-2">Minimum spend: ${discount.minimum_spend}</p>}
                  {discount.maximum_spend && <p className="text-sm mb-2">Maximum spend: ${discount.maximum_spend}</p>}
                  <Button
                    variant="secondary"
                    onClick={() => handleUseCode(discount.discount_code)}
                    className="mt-4 bg-white text-purple-600 hover:bg-gray-100"
                  >
                    Use Code
                  </Button>
                </CardContent>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

