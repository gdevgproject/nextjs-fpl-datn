// sử dụng hàm get_best_selling_products từ schema.txt để lấy danh sách sản phẩm bán chạy nhất với giới hạn là 8 sản phẩm

import { getBestSellingProducts } from "../home-data";
import { ProductSection } from "./product-section";

export async function BestSellersSection() {
  const products = await getBestSellingProducts(8);
  return (
    <ProductSection
      title="Bán chạy nhất"
      description="Những sản phẩm được khách hàng tin dùng và lựa chọn nhiều nhất"
      products={products}
      viewAllLink="/san-pham?sort=best-selling"
      bgColor="muted"
    />
  );
}
