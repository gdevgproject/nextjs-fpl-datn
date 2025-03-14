"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useCart } from "@/features/cart/hooks/useCart"

export function CartDropdown() {
  const { items, removeItem, totalItems } = useCart()

  return (
    <div className="w-full bg-white rounded-md shadow-md overflow-hidden pointer-events-auto">
      <div className="p-4 border-b border-grayscale-20">
        <h3 className="text-lg font-semibold text-grayscale-90 text-center">Giỏ hàng</h3>
      </div>

      {items.length > 0 ? (
        <>
          <div className="max-h-[60vh] overflow-y-auto">
            <ul className="divide-y divide-grayscale-20">
              {items.map((item) => (
                <li key={item.id} className="p-4 flex gap-3 items-center">
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-grayscale-90 line-clamp-2">{item.name}</h4>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-[#0D6EFD]">{item.price.toLocaleString()}đ</span>
                      {item.originalPrice && (
                        <span className="text-xs text-grayscale-50 line-through">
                          {item.originalPrice.toLocaleString()}đ
                        </span>
                      )}
                      <span className="text-xs text-grayscale-50">
                        x{item.quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                  <button
                    className="text-error-50 hover:text-error-60 transition-colors p-2"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-white border-t border-grayscale-20">
            <div className="flex justify-between items-center">
              <span className="text-sm text-grayscale-60">{totalItems} sản phẩm</span>
              <Link href="/cart">
                <Button className="bg-[#0D6EFD] hover:bg-[#0D6EFD]/90 rounded-[100px] px-8">Xem giỏ hàng</Button>
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 text-grayscale-30 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <p className="text-grayscale-50 mb-4">Giỏ hàng của bạn đang trống</p>
          <Link href="/products">
            <Button className="bg-[#0D6EFD] hover:bg-[#0D6EFD]/90 rounded-[100px]">Mua sắm ngay</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

