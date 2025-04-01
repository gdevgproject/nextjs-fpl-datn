"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag, X, Plus, Minus, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/hooks/use-cart"
import { formatCurrency } from "@/lib/utils"
import { useOnClickOutside } from "@/lib/hooks/use-on-click-outside"

export function MiniCart() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart()
  const ref = useRef<HTMLDivElement>(null)

  useOnClickOutside(ref, () => setIsOpen(false))

  // Close mini cart when pressing escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [])

  // Prevent scrolling when mini cart is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  return (
    <div className="relative" ref={ref}>
      {/* Cart Icon with Badge */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Giỏ hàng có ${itemCount} sản phẩm`}
      >
        <ShoppingBag className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {itemCount}
          </span>
        )}
      </Button>

      {/* Mini Cart Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Mini Cart Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, x: "100%" }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 10, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l bg-background p-4 shadow-lg md:absolute md:inset-auto md:right-0 md:top-12 md:h-auto md:max-h-[calc(100vh-10rem)] md:w-96 md:rounded-lg md:border"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Giỏ hàng ({itemCount})</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Đóng</span>
                </Button>
              </div>

              <Separator className="my-3" />

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <ShoppingBag className="mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="mb-4 text-center text-muted-foreground">Giỏ hàng của bạn đang trống</p>
                  <Button asChild onClick={() => setIsOpen(false)}>
                    <Link href="/san-pham">Mua sắm ngay</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[50vh] md:h-[40vh]">
                    <ul className="space-y-4 pr-3">
                      {items.map((item) => (
                        <li key={item.id} className="flex gap-3">
                          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col">
                            <div className="flex justify-between">
                              <Link
                                href={`/san-pham/${item.slug}`}
                                className="line-clamp-2 font-medium hover:text-primary"
                                onClick={() => setIsOpen(false)}
                              >
                                {item.name}
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => removeItem(item.id)}
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Xóa</span>
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.brand} - {item.volume}
                            </p>
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center rounded-md border">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-none"
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                  <span className="sr-only">Giảm</span>
                                </Button>
                                <span className="flex h-7 w-7 items-center justify-center text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-none"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                  <span className="sr-only">Tăng</span>
                                </Button>
                              </div>
                              <p className="font-medium">
                                {formatCurrency((item.salePrice || item.price) * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>

                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between font-medium">
                      <span>Tạm tính</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button variant="outline" className="flex-1" onClick={() => setIsOpen(false)} asChild>
                        <Link href="/gio-hang">Xem giỏ hàng</Link>
                      </Button>
                      <Button className="flex-1 gap-1" onClick={() => setIsOpen(false)} asChild>
                        <Link href="/thanh-toan">
                          Thanh toán
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

