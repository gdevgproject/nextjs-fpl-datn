import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface BrandCardProps {
  brand: {
    id: number
    name: string
    slug: string
    logo: string
    productCount: number
  }
  className?: string
}

export function BrandCard({ brand, className }: BrandCardProps) {
  return (
    <Link
      href={`/thuong-hieu/${brand.slug}`}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border bg-background p-4 transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="mb-3 h-16 w-16 overflow-hidden rounded-full bg-muted/30 p-2">
        <Image
          src={brand.logo || "/placeholder.svg"}
          alt={brand.name}
          width={100}
          height={100}
          className="h-full w-full object-contain"
        />
      </div>
      <h3 className="text-center font-medium">{brand.name}</h3>
      <p className="text-center text-sm text-muted-foreground">{brand.productCount} sản phẩm</p>
    </Link>
  )
}

