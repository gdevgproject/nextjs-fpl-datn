import { ProductCard } from "@/components/san-pham/product-card"

interface Product {
  id: number
  name: string
  slug: string
  brand: string
  price: number
  salePrice: number | null
  image: string
  rating: number
  isNew?: boolean
  isBestSeller?: boolean
  isSale?: boolean
  description?: string
  reviewCount?: number
}

interface ProductGridViewProps {
  products: Product[]
}

export function ProductGridView({ products }: ProductGridViewProps) {
  if (!products.length) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Không tìm thấy sản phẩm phù hợp.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

