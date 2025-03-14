"use client"

import { useState } from "react"
import MegaMenuItem from "./MegaMenuItem"
import MegaMenuItemLink from "./MegaMenuItemLink"
import MegaMenuColumn from "./MegaMenuColumn"
import { useMenu } from "@/features/menu/hooks/useMenu"

export default function MegaMenu() {
  const { categories, bestSellingProducts } = useMenu()
  const [activeCategory, setActiveCategory] = useState(categories.length > 0 ? categories[0].id : "")

  const activeProducts = categories.find((cat) => cat.id === activeCategory)?.products || []

  return (
    <nav className="border-t border-white/10">
      <div className="container mx-auto px-4">
        <ul className="flex space-x-8 py-4">
          <li>
            <MegaMenuItem label="Sản phẩm" href="/products" hasDropdown>
              <div className="flex gap-6">
                {/* Categories */}
                <div className="w-64 rounded-lg bg-white">
                  {categories.map((category) => (
                    <MegaMenuItemLink
                      key={category.id}
                      href={`/categories/${category.id}`}
                      icon={category.icon}
                      label={category.label}
                      isActive={category.id === activeCategory}
                      onMouseEnter={() => setActiveCategory(category.id)}
                    />
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <MegaMenuColumn categoryProducts={activeProducts} bestSellingProducts={bestSellingProducts} />
                </div>
              </div>
            </MegaMenuItem>
          </li>

          <li>
            <MegaMenuItem label="Giải Pháp" href="/solutions" />
          </li>
          <li>
            <MegaMenuItem label="Đo Cao" href="/height-measurement" />
          </li>
          <li>
            <MegaMenuItem label="Kiểm Tra Dinh Dưỡng" href="/nutrition-check" />
          </li>
          <li>
            <MegaMenuItem label="Hệ Thống Cửa Hàng" href="/trusted-shops" />
          </li>
          <li>
            <MegaMenuItem label="Liên Hệ" href="/contact" />
          </li>
        </ul>
      </div>
    </nav>
  )
}

