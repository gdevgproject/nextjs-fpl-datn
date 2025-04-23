import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { ProductRecommendation } from "../types"
import Link from "next/link"
import { formatCurrency } from "@/shared/lib/utils"

interface ProductRecommendationCardProps {
  product: ProductRecommendation
}

export function ProductRecommendationCard({ product }: ProductRecommendationCardProps) {
  return (
    <Link href={`/san-pham/${product.slug}`} className="block">
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.image_url || `/placeholder.svg?height=200&width=200&query=perfume bottle`}
            alt={product.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-2">{product.name}</h3>
          {product.brand_name && <p className="text-sm text-muted-foreground">{product.brand_name}</p>}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div className="flex flex-col">
            {product.sale_price ? (
              <>
                <span className="text-sm font-medium text-primary">{formatCurrency(product.sale_price)}</span>
                <span className="text-xs line-through text-muted-foreground">{formatCurrency(product.price)}</span>
              </>
            ) : (
              <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
