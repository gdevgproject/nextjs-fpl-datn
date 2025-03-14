import type { MenuItem, MenuCategory, BestSellingProduct, MenuService } from "../types/menuTypes"

// Mock menu data
const mockMenuItems: MenuItem[] = [
  { id: "products", label: "Sản phẩm", href: "/products", hasDropdown: true },
  { id: "solutions", label: "Giải Pháp", href: "/solutions" },
  { id: "height", label: "Đo Cao", href: "/height-measurement" },
  { id: "nutrition", label: "Kiểm Tra Dinh Dưỡng", href: "/nutrition-check" },
  { id: "shops", label: "Hệ Thống Cửa Hàng", href: "/trusted-shops" },
  { id: "contact", label: "Liên Hệ", href: "/contact" },
]

const mockCategories: MenuCategory[] = [
  {
    id: "vitamin",
    label: "Vitamin & Khoáng chất",
    icon: "/placeholder.svg",
    products: [
      { id: "1", name: "Bổ sung Canxi & Vitamin D", image: "/placeholder.svg" },
      { id: "2", name: "Vitamin tổng hợp", image: "/placeholder.svg" },
      { id: "3", name: "Dầu cá, Omega 3, DHA", image: "/placeholder.svg" },
      { id: "4", name: "Vitamin C các loại", image: "/placeholder.svg" },
      { id: "5", name: "Bổ sung Sắt & Axit Folic", image: "/placeholder.svg" },
    ],
  },
  {
    id: "sinh-ly",
    label: "Sinh lý & Nội tiết tố",
    icon: "/placeholder.svg",
    products: [
      { id: "6", name: "Sản phẩm cho nam giới", image: "/placeholder.svg" },
      { id: "7", name: "Sản phẩm cho nữ giới", image: "/placeholder.svg" },
    ],
  },
  // Other categories...
]

const mockBestSellingProducts: BestSellingProduct[] = [
  {
    id: "1",
    name: "Viên uống NutriGrow Nutrimed bổ sung canxi, vitamin D3",
    image: "/placeholder.svg",
    price: 480000,
    originalPrice: 600000,
    unit: "Hộp",
  },
  {
    id: "2",
    name: "Viên uống Rama Bổ Phổi hỗ trợ bổ phổi, giảm ho hiệu quả",
    image: "/placeholder.svg",
    price: 155000,
    originalPrice: 200000,
    unit: "Hộp",
  },
  {
    id: "3",
    name: "Viên uống Rama Bổ Phổi hỗ trợ bổ phổi, giảm ho hiệu quả",
    image: "/placeholder.svg",
    price: 155000,
    originalPrice: 200000,
    unit: "Hộp",
  },
]

export class MenuMockService implements MenuService {
  async getMenuItems(): Promise<MenuItem[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockMenuItems
  }

  async getCategories(): Promise<MenuCategory[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockCategories
  }

  async getBestSellingProducts(): Promise<BestSellingProduct[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockBestSellingProducts
  }
}

// Export a singleton instance
export const menuMockService = new MenuMockService()

