import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

export function EmptyWishlist() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <Heart className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Danh sách yêu thích trống</h3>
        <p className="text-sm text-muted-foreground mt-1 text-center max-w-md">
          Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy thêm sản phẩm
          yêu thích để dễ dàng theo dõi và mua sau.
        </p>
        <Button asChild className="mt-4">
          <Link href="/san-pham">Khám phá sản phẩm</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
