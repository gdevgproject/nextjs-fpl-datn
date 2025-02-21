"use client"

import { useParams } from "next/navigation"

export default function CategoryPage() {
  const { category } = useParams()
  return <div>Category Page: {category}</div>
}

