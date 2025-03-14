import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/mockData";
import { Heart, Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group relative bg-white rounded-lg shadow-sm overflow-hidden">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {product.name}
          </h3>
        </Link>

        <div className="mt-1 flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              ${product.price}
            </p>
            {product.listed_price > product.price && (
              <p className="text-sm text-gray-500 line-through">
                ${product.listed_price}
              </p>
            )}
          </div>
          <button className="p-2 hover:text-red-500">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-2 flex items-center space-x-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <Star className="w-4 h-4 text-gray-300 fill-current" />
          </div>
          <span className="text-sm text-gray-500">(24)</span>
        </div>

        <div className="mt-2 text-sm text-gray-500">
          <span className="capitalize">{product.gender}</span> •{" "}
          {product.concentration}
        </div>
      </div>
    </div>
  );
}
