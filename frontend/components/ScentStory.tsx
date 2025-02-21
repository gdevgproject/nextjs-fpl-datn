import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { Category } from "@/lib/mockData"

interface ScentStoryProps {
  categories: Category[]
}

export default function ScentStory({ categories }: ScentStoryProps) {
  const featuredCategories = categories.filter((category) => category.level === 0)

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center font-serif">Explore the World of Fragrances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCategories.map((category) => (
            <Link href={`/category/${category.id}`} key={category.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-64">
                  <Image
                    src={`/category-${category.id}.jpg`}
                    alt={category.name}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <CardContent className="text-center text-white">
                      <h3 className="text-2xl font-bold mb-2 font-serif">{category.name}</h3>
                      <p className="text-sm font-sans">Discover the essence</p>
                    </CardContent>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

