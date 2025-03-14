// Types for menu feature
export interface MenuItem {
  id: string
  label: string
  href: string
  icon?: string
  hasDropdown?: boolean
}

export interface CategoryProduct {
  id: string
  name: string
  image: string
}

export interface BestSellingProduct {
  id: string
  name: string
  image: string
  price: number
  originalPrice: number
  unit: string
}

export interface MenuCategory {
  id: string
  label: string
  icon: string
  products: CategoryProduct[]
}

export interface MenuService {
  getMenuItems(): Promise<MenuItem[]>
  getCategories(): Promise<MenuCategory[]>
  getBestSellingProducts(): Promise<BestSellingProduct[]>
}

