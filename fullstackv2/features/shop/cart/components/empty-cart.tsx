import Link from "next/link"
import { ShoppingCart, ArrowRight, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart as useCartContext } from "@/features/shop/cart/context/cart-context"

interface EmptyCartProps {
  hasInteracted?: boolean
}

export function EmptyCart({ hasInteracted }: EmptyCartProps) {
  const { isGuest, hasInteracted: contextHasInteracted } = useCartContext()

  // Use prop if provided, otherwise use context value
  const userHasInteracted = hasInteracted !== undefined ? hasInteracted : contextHasInteracted

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-muted rounded-full p-6 mb-6">
        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
      </div>

      {isGuest && !userHasInteracted ? (
        // Guest user who has never added items
        <>
          <h2 className="text-2xl font-semibold mb-2">Giỏ hàng của bạn đang trống</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các sản phẩm của chúng tôi và tìm thấy những món đồ
            yêu thích của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/san-pham" className="flex items-center">
                Khám phá sản phẩm
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login" className="flex items-center">
                Đăng nhập
                <LogIn className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </>
      ) : isGuest && userHasInteracted ? (
        // Guest user who had items but removed them all
        <>
          <h2 className="text-2xl font-semibold mb-2">Giỏ hàng của bạn đã trống</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Bạn đã xóa tất cả sản phẩm khỏi giỏ hàng. Hãy tiếp tục mua sắm để thêm sản phẩm vào giỏ hàng của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link href="/san-pham" className="flex items-center">
                Tiếp tục mua sắm
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login" className="flex items-center">
                Đăng nhập để xem giỏ hàng đã lưu
                <LogIn className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </>
      ) : (
        // Logged in user with empty cart
        <>
          <h2 className="text-2xl font-semibold mb-2">Giỏ hàng của bạn đang trống</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các sản phẩm của chúng tôi và tìm thấy những
            món đồ yêu thích của bạn.
          </p>
          <Button asChild size="lg">
            <Link href="/san-pham" className="flex items-center">
              Tiếp tục mua sắm
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </>
      )}
    </div>
  )
}
