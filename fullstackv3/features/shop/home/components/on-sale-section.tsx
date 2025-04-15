import { getProductsOnSale } from "../home-data";
import { ProductSection } from "./product-section";

export async function OnSaleSection() {
  const products = await getProductsOnSale(8);
  return (
    <ProductSection
      title="Đang giảm giá"
      description="Cơ hội sở hữu những sản phẩm chất lượng với giá tốt nhất"
      products={products}
      viewAllLink="/san-pham?sale=true"
      bgColor="subtle"
    />
  );
}
