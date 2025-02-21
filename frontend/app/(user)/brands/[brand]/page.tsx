"use client"

import { useParams } from "next/navigation"

export default function BrandPage() {
  const { brand } = useParams()
  return <div>Brand Page: {brand}</div>
}

