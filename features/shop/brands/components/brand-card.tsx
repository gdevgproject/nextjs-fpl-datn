import Link from "next/link"
import Image from "next/image"
import type { Brand } from "../types"

interface BrandCardProps {
  brand: Brand
  productCount: number
}

export function BrandCard({
  brand,
  productCount,
}: {
  brand: Brand
  productCount: number
}) {
  return (
    <Link
      href={`/san-pham?brand=${brand.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary"
    >
      <div className="relative aspect-square overflow-hidden bg-muted p-4">
        {brand.logo_url ? (
          <div className="flex h-full items-center justify-center">
            <Image
              src={brand.logo_url || "/placeholder.svg"}
              alt={brand.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-lg font-medium text-center">{brand.name}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium line-clamp-1">{brand.name}</h3>
        {brand.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{brand.description}</p>}
        <p className="mt-2 text-xs text-muted-foreground">{productCount} sản phẩm</p>
      </div>
    </Link>
  )
}

