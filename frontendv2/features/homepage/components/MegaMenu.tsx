"use client"

import { useState, useRef } from "react"
import { Menu } from "lucide-react"
import MegaMenuItem from "./MegaMenuItem"
import MegaMenuItemLink from "./MegaMenuItemLink"
import MegaMenuColumn from "./MegaMenuColumn"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useMenu } from "@/features/menu/hooks/useMenu"

export default function MegaMenu() {
  const { categories, bestSellingProducts } = useMenu()
  const [activeCategory, setActiveCategory] = useState(categories.length > 0 ? categories[0].id : "")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const megaMenuRef = useRef<HTMLButtonElement>(null)

  const activeProducts = categories.find((cat) => cat.id === activeCategory)?.products || []

  return (
    <nav className="bg-white text-black border-t border-grayscale-20">
      <div className="container mx-auto px-4">
        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-4 lg:space-x-8 py-4">
          <li>
            <MegaMenuItem label="Sản phẩm" href="/products" hasDropdown>
              <div className="flex">
                {/* Categories */}
                <div className="w-64 rounded-lg">
                  {categories.map((category, index) => (
                    <div key={category.id}>
                      <MegaMenuItemLink
                        href={`/categories/${category.id}`}
                        icon={category.icon}
                        label={category.label}
                        isActive={category.id === activeCategory}
                        onMouseEnter={() => setActiveCategory(category.id)}
                      />
                      {index < categories.length - 1 &&
                        category.id !== activeCategory &&
                        categories[index + 1].id !== activeCategory && <Separator className="mx-4" />}
                    </div>
                  ))}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <MegaMenuColumn
                    activeCategory={activeCategory}
                    categoryProducts={activeProducts}
                    bestSellingProducts={bestSellingProducts}
                  />
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
          <li className="hidden lg:block">
            <MegaMenuItem label="Hệ Thống Cửa Hàng" href="/trusted-shops" />
          </li>
          <li className="hidden lg:block">
            <MegaMenuItem label="Liên Hệ" href="/contact" />
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center py-3">
          <Button
            ref={megaMenuRef}
            className="text-primary p-1"
            variant="ghost"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="ml-2">Menu</span>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent className="w-[85vw] sm:w-[350px] p-0" side="left">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-bold text-lg">Menu</h2>
              </div>

              <div className="flex-1 overflow-auto">
                <Accordion collapsible className="w-full" type="single">
                  <AccordionItem className="border-b" value="products">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">Sản phẩm</AccordionTrigger>
                    <AccordionContent className="pt-1 pb-3">
                      <Accordion collapsible className="w-full" type="single">
                        {categories.map((category) => (
                          <AccordionItem key={category.id} className="border-0" value={category.id}>
                            <AccordionTrigger className="px-6 py-2 text-sm hover:no-underline">
                              {category.label}
                            </AccordionTrigger>
                            <AccordionContent className="pt-1 pb-2 px-8">
                              <ul className="space-y-2">
                                {category.products && category.products.length > 0 ? (
                                  category.products.map((product) => (
                                    <li key={product.id} className="text-sm">
                                      <a className="hover:text-primary" href={`/products/${product.id}`}>
                                        {product.name}
                                      </a>
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-sm text-grayscale-40">Không có sản phẩm</li>
                                )}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem className="border-b" value="solutions">
                    <a className="flex py-3 px-4" href="/solutions">
                      Giải Pháp
                    </a>
                  </AccordionItem>

                  <AccordionItem className="border-b" value="height">
                    <a className="flex py-3 px-4" href="/height-measurement">
                      Đo Cao
                    </a>
                  </AccordionItem>

                  <AccordionItem className="border-b" value="nutrition">
                    <a className="flex py-3 px-4" href="/nutrition-check">
                      Kiểm Tra Dinh Dưỡng
                    </a>
                  </AccordionItem>

                  <AccordionItem className="border-b" value="shops">
                    <a className="flex py-3 px-4" href="/trusted-shops">
                      Hệ Thống Cửa Hàng
                    </a>
                  </AccordionItem>

                  <AccordionItem className="border-b" value="contact">
                    <a className="flex py-3 px-4" href="/contact">
                      Liên Hệ
                    </a>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}

