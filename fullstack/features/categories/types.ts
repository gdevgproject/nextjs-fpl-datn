/**
 * Category entity
 */
export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  is_featured: boolean
  display_order: number
  parent_category_id: number | null
  created_at: string
  updated_at: string
  parent_category?: Category
  sub_categories?: Category[]
}

/**
 * Product count by category ID
 */
export interface CategoryProductCount {
  [categoryId: number]: number
}

/**
 * Category tree node
 */
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[]
}

