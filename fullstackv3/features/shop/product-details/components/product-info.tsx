"use client";

import { useState } from "react";
import { useCartContext } from "@/features/shop/cart/providers/cart-provider";
import { formatCurrency } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, AlertCircle } from "lucide-react";
import VariantSelector from "./variant-selector";
import { toast } from "sonner";

interface ProductInfoProps {
  product: {
    id: number;
    name: string;
    short_description: string | null;
    release_year: number | null;
  };
  brand: {
    id: number;
    name: string;
    logo_url: string | null;
  };
  variants: Array<{
    id: number;
    product_id: number;
    volume_ml: number;
    price: number;
    sale_price: number | null;
    sku: string;
    stock_quantity: number;
  }>;
  gender: {
    id: number;
    name: string;
  } | null;
  concentration: {
    id: number;
    name: string;
  } | null;
  perfumeType: {
    id: number;
    name: string;
  } | null;
}

export default function ProductInfo({
  product,
  brand,
  variants,
  gender,
  concentration,
  perfumeType,
}: ProductInfoProps) {
  const { addToCart, isUpdatingCart } = useCartContext();
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  const [quantity, setQuantity] = useState(1);

  // Map variants to match VariantSelector's expected shape
  const variantSelectorVariants = variants.map((v) => ({
    id: v.id,
    volume_ml: v.volume_ml,
    price: v.price,
    sale_price: v.sale_price,
    stock_quantity: v.stock_quantity,
  }));

  // Check if the product is on sale
  const isOnSale = selectedVariant && selectedVariant.sale_price !== null;

  // Calculate discount percentage if on sale
  const discountPercentage =
    isOnSale && selectedVariant
      ? Math.round(
          ((selectedVariant.price - selectedVariant.sale_price!) /
            selectedVariant.price) *
            100
        )
      : 0;

  // Check if the selected variant is in stock
  const isInStock = selectedVariant && selectedVariant.stock_quantity > 0;

  // Get stock status text and color
  const getStockStatusDisplay = () => {
    if (!selectedVariant) return null;

    const stockQty = selectedVariant.stock_quantity;

    if (stockQty <= 0) {
      return {
        text: "Hết hàng",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    } else if (stockQty <= 5) {
      return {
        text: `Còn ${stockQty} sản phẩm`,
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    } else {
      return {
        text: `Còn hàng (${stockQty})`,
        className: "bg-green-50 text-green-700 border-green-200",
      };
    }
  };

  const stockStatus = getStockStatusDisplay();

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn phiên bản sản phẩm");
      return;
    }

    if (!isInStock) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    try {
      await addToCart(selectedVariant.id, quantity);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng");
    }
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (!selectedVariant) return;

    // Ensure quantity doesn't exceed stock
    const maxQuantity = selectedVariant.stock_quantity;
    const validQuantity = Math.min(Math.max(1, newQuantity), maxQuantity);

    setQuantity(validQuantity);
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Brand */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">
          {brand.name}
        </h3>
      </div>

      {/* Product Name */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {product.name}
        </h1>
        {product.release_year && (
          <p className="text-sm text-muted-foreground mt-1">
            {product.release_year}
          </p>
        )}
      </div>

      {/* Product Attributes */}
      <div className="flex flex-wrap gap-2">
        {gender && <Badge variant="outline">{gender.name}</Badge>}
        {concentration && <Badge variant="outline">{concentration.name}</Badge>}
        {perfumeType && <Badge variant="outline">{perfumeType.name}</Badge>}
      </div>

      {/* Short Description */}
      {product.short_description && (
        <p className="text-base text-muted-foreground">
          {product.short_description}
        </p>
      )}

      {/* Variant Selector */}
      <div>
        <h3 className="text-sm font-medium mb-2">Dung tích</h3>
        <VariantSelector
          variants={variantSelectorVariants}
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant as any}
        />
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        {isOnSale ? (
          <>
            <span className="text-2xl sm:text-3xl font-bold text-primary">
              {formatCurrency(selectedVariant.sale_price!)}
            </span>
            <span className="text-lg sm:text-xl text-muted-foreground line-through">
              {formatCurrency(selectedVariant.price)}
            </span>
            <Badge className="ml-2 bg-red-500">
              {discountPercentage}% giảm
            </Badge>
          </>
        ) : (
          <span className="text-2xl font-bold">
            {selectedVariant ? formatCurrency(selectedVariant.price) : ""}
          </span>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {stockStatus && (
          <Badge variant="outline" className={stockStatus.className}>
            {stockStatus.text}
          </Badge>
        )}

        {selectedVariant &&
          selectedVariant.stock_quantity <= 5 &&
          selectedVariant.stock_quantity > 0 && (
            <div className="flex items-center text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Sắp hết hàng</span>
            </div>
          )}
      </div>

      {/* Quantity Selector */}
      {isInStock && (
        <div>
          <h3 className="text-sm font-medium mb-2">Số lượng</h3>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <span className="mx-4 min-w-[2rem] text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={
                selectedVariant && quantity >= selectedVariant.stock_quantity
              }
            >
              +
            </Button>
          </div>
        </div>
      )}

      {/* Add to Cart */}
      <div className="flex gap-2">
        <Button
          onClick={handleAddToCart}
          disabled={!isInStock || isUpdatingCart}
          className="flex-1"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Thêm vào giỏ hàng
        </Button>
        <Button variant="outline">
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>

      {/* SKU */}
      {selectedVariant && (
        <p className="text-xs text-muted-foreground">
          SKU: {selectedVariant.sku}
        </p>
      )}
    </div>
  );
}
