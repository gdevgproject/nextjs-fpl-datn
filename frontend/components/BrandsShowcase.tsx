import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import type { Brand } from "@/lib/mockData"

interface BrandsShowcaseProps {
  brands: Brand[]
}

export default function BrandsShowcase({ brands }: BrandsShowcaseProps) {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Top Brands</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <Link href={`/brand/${brand.id}`} key={brand.id}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="relative w-24 h-24 mb-2">
                    <Image src={brand.logo || "/placeholder.svg"} alt={brand.name} layout="fill" objectFit="contain" />
                  </div>
                  <h3 className="text-sm font-semibold text-center">{brand.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

