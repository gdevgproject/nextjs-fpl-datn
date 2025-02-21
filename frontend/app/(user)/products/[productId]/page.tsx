"use client"

import { useParams } from "next/navigation"

export default function ProductPage() {
  const { productId } = useParams()
  return <div>Product Page: {productId}</div>
}

