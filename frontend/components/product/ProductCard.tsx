import { Product } from "@/lib/mockData";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2">
            {product.description.substring(0, 100)}...
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-primary-600">
              ${product.price}
            </span>
            {product.is_hot === "yes" && (
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                Hot
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
