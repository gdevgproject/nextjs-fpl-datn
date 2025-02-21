"use client"

import { useParams } from "next/navigation"

export default function SubCategoryPage() {
  const { category, subCategory } = useParams()
  return (
    <div>
      Sub-Category Page: {category} / {subCategory}
    </div>
  )
}

