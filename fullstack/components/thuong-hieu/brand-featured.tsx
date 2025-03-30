import { BrandCard } from "@/components/thuong-hieu/brand-card"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Brand {
  id: number
  name: string
  slug: string
  logo: string
  productCount: number
  origin: string
  isFeatured: boolean
}

interface BrandFeaturedProps {
  brands: Brand[]
}

export function BrandFeatured({ brands }: BrandFeaturedProps) {
  if (!brands.length) return null

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-6">
        <h2 className="text-xl font-medium mb-6">Thương hiệu nổi bật</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} className={cn("bg-background", "hover:border-primary/50")} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

