"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Home,
  Image,
  Layers,
  Menu,
  MessageSquare,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Tag,
  Users,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: Layers, label: "Categories", href: "/admin/categories" },
  { icon: Tag, label: "Brands", href: "/admin/brands" },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Percent, label: "Discounts", href: "/admin/discounts" },
  { icon: Image, label: "Slides", href: "/admin/slides" },
  { icon: MessageSquare, label: "Reviews", href: "/admin/reviews" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
]

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 md:hidden" // Hide on larger screens
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      {/* Backdrop to close sidebar when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white text-black shadow-lg transition-transform duration-300 ease-in-out transform md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:shadow-none md:border-r", // Keep sidebar visible on larger screens
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-100">
          <Link href="/admin" className="text-2xl font-bold">
            Admin
          </Link>
        </div>
        <nav className="mt-5 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                pathname === item.href ? "bg-gray-200 text-black" : "text-gray-600 hover:bg-gray-100 hover:text-black",
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}

