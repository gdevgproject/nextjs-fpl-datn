import Link from "next/link"
import { ArrowRight, FolderOpen } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface Subcategory {
  id: number
  name: string
  slug: string
  productCount: number
}

interface CategorySubcategoriesProps {
  subcategories: Subcategory[]
  parentCategorySlug: string
}

export function CategorySubcategories({ subcategories, parentCategorySlug }: CategorySubcategoriesProps) {
  if (!subcategories.length) return null

  return (
    <div>
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <FolderOpen className="mr-2 h-5 w-5 text-muted-foreground" />
        Danh mục con
      </h2>

      <ScrollArea className="pb-4 md:hidden">
        <div className="flex gap-3">
          {subcategories.map((subcategory) => (
            <Link
              key={subcategory.id}
              href={`/danh-muc/${subcategory.slug}`}
              className="min-w-[160px] flex-shrink-0 px-4 py-3 bg-muted/50 rounded-md hover:bg-muted transition-colors border border-border"
            >
              <div className="font-medium">{subcategory.name}</div>
              <div className="text-sm text-muted-foreground">{subcategory.productCount} sản phẩm</div>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3">
        {subcategories.map((subcategory) => (
          <Link
            key={subcategory.id}
            href={`/danh-muc/${subcategory.slug}`}
            className="flex justify-between items-center px-4 py-3 bg-muted/50 rounded-md hover:bg-muted transition-colors border border-border group"
          >
            <div>
              <div className="font-medium group-hover:text-primary transition-colors">{subcategory.name}</div>
              <div className="text-sm text-muted-foreground">{subcategory.productCount} sản phẩm</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  )
}

