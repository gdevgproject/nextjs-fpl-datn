import { getProducts } from "../queries"
import { ProductCard } from "@/components/shared/product-card"

export async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Sản phẩm</h1>
        <p className="text-muted-foreground">Khám phá bộ sưu tập nước hoa chính hãng đa dạng của chúng tôi</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

