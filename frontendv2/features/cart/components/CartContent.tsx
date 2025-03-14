"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { CartItems } from "./CartItems"
import { CartSummary } from "./CartSummary"
import { useCart } from "../contexts/CartContext"

export function CartContent() {
  const { items, updateQuantity, removeItem, updateUnit } = useCart()
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  useEffect(() => {
    if (items.length > 0) {
      setSelectedItems(items.map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }, [items])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id])
    } else {
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id))
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Link href="/" className="inline-flex items-center text-blue-600 mb-6 hover:underline">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Tiếp tục mua sắm
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CartItems
            items={items}
            selectedItems={selectedItems}
            onSelectAll={handleSelectAll}
            onSelectItem={handleSelectItem}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onUpdateUnit={updateUnit}
          />
        </div>
        <div>
          <CartSummary items={items.filter((item) => selectedItems.includes(item.id))} selectedItems={selectedItems} />
        </div>
      </div>
    </div>
  )
}

