import { Product } from "@/lib/mockData";
import Image from "next/image";
import Link from "next/link";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="group"
        >
          <div className="aspect-square relative mb-2 overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <h3 className="font-medium text-sm">{product.name}</h3>
          <p className="text-sm text-gray-500">
            {product.price.toLocaleString("vi-VN")}đ
          </p>
        </Link>
      ))}
    </div>
  );
}
