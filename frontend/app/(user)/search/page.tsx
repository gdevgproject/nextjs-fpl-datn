"use client"

import { useSearchParams } from "next/navigation"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q")
  return <div>Search Page: {query}</div>
}

