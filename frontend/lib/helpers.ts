import { Product } from "./mockData";

export const getProductsByCategory = (
  products: Product[],
  categoryId: string
): Product[] => {
  return products.filter((product) => product.category === categoryId);
};
