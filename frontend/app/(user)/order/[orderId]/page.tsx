"use client"

import { useParams } from "next/navigation"

export default function OrderPage() {
  const { orderId } = useParams()
  return <div>Order Page: {orderId}</div>
}

