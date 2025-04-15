/**
 * @file home-data.ts
 * File này đóng vai trò làm lớp wrapper giữa UI components và services
 * Đảm bảo các components gọi đúng hàm từ services.ts
 */

import {
  fetchActiveBanners,
  fetchBestSellingProducts,
  fetchFeaturedBrands,
  fetchFeaturedCategories,
  fetchFeaturedProducts,
  fetchNewArrivals,
  fetchProductsOnSale,
} from "./services";

import type { Banner, Brand, Category, Product } from "./types";

// Re-export các hàm lấy dữ liệu từ services.ts với interface giống queries.ts cũ
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return fetchFeaturedProducts(limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return fetchNewArrivals(limit);
}

export async function getProductsOnSale(limit = 8): Promise<Product[]> {
  return fetchProductsOnSale(limit);
}

export async function getBestSellingProducts(limit = 8): Promise<Product[]> {
  return fetchBestSellingProducts(limit);
}

export async function getFeaturedCategories(limit = 6): Promise<Category[]> {
  return fetchFeaturedCategories(limit);
}

export async function getFeaturedBrands(limit = 8): Promise<Brand[]> {
  return fetchFeaturedBrands(limit);
}

export async function getActiveBanners(): Promise<Banner[]> {
  return fetchActiveBanners();
}
