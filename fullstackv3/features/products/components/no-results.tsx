import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PackageSearch } from "lucide-react"

export function NoResults() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <PackageSearch className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">Không tìm thấy sản phẩm</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn. Hãy thử thay đổi bộ lọc hoặc xem tất cả sản phẩm.
      </p>
      <Button asChild className="mt-4">
        <Link href="/san-pham">Xem tất cả sản phẩm</Link>
      </Button>
    </div>
  )
}

