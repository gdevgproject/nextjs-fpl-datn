import { getNewArrivals } from "../home-data";
import { ProductSection } from "./product-section";

export async function NewArrivalsSection() {
  const products = await getNewArrivals(8);
  return (
    <ProductSection
      title="Sản phẩm mới"
      description="Những sản phẩm mới nhất vừa cập nhật"
      products={products}
      viewAllLink="/san-pham?sort=newest"
      bgColor="accent"
    />
  );
}
