import axios from "axios"
import type { MenuItem, MenuCategory, BestSellingProduct, MenuService } from "../types/menuTypes"

export class MenuRealService implements MenuService {
  async getMenuItems(): Promise<MenuItem[]> {
    const response = await axios.get("/api/menu/items")
    return response.data
  }

  async getCategories(): Promise<MenuCategory[]> {
    const response = await axios.get("/api/menu/categories")
    return response.data
  }

  async getBestSellingProducts(): Promise<BestSellingProduct[]> {
    const response = await axios.get("/api/menu/best-selling")
    return response.data
  }
}

// Export a singleton instance
export const menuRealService = new MenuRealService()

