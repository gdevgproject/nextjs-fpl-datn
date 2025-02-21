import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart } from "lucide-react"
import type { Product, Brand } from "@/lib/mockData"

interface HotPicksProps {
  products: Product[]
  brands: Brand[]
}

export default function HotPicks({ products, brands }: HotPicksProps) {
  const hotProducts = products
    .filter((product) => product.is_hot === "yes")
    .sort((a, b) => b.view - a.view)
    .slice(0, 8)

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center font-serif">Hot Picks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {hotProducts.map((product) => {
            const brand = brands.find((b) => b.id === product.fragrance_brand_id)
            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative h-64">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 hover:scale-105"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-red-500 hover:text-red-600 bg-white bg-opacity-50 hover:bg-opacity-75"
                  >
                    <Heart className="h-6 w-6" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-1 font-serif">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{brand?.name}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                      {product.price < product.listed_price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${product.listed_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button asChild variant="outline" className="w-[48%]">
                    <Link href={`/product/${product.id}`}>View Details</Link>
                  </Button>
                  <Button className="w-[48%]">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

