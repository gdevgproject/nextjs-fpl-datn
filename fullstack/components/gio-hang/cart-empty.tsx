"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingBag, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CartEmpty() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12 text-center"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div className="mb-6 rounded-full bg-muted p-6" variants={item}>
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
      </motion.div>
      <motion.h2 className="mb-2 text-2xl font-bold" variants={item}>
        Giỏ hàng trống
      </motion.h2>
      <motion.p className="mb-6 text-center text-muted-foreground max-w-md mx-auto" variants={item}>
        Bạn chưa có sản phẩm nào trong giỏ hàng.
        <br />
        Hãy thêm sản phẩm vào giỏ hàng để tiến hành thanh toán.
      </motion.p>
      <motion.div variants={item}>
        <Button asChild size="lg" className="gap-2">
          <Link href="/san-pham">
            Tiếp tục mua sắm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  )
}

