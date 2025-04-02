import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface ReviewFilterProps {
  className?: string
}

export function ReviewFilter({ className }: ReviewFilterProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle>Lọc đánh giá</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="product">Sản phẩm</Label>
          <Select defaultValue="all">
            <SelectTrigger id="product">
              <SelectValue placeholder="Chọn sản phẩm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả sản phẩm</SelectItem>
              <SelectItem value="product1">Chanel No.5</SelectItem>
              <SelectItem value="product2">Dior Sauvage</SelectItem>
              <SelectItem value="product3">Gucci Bloom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Đánh giá</Label>
          <div className="flex items-center justify-between">
            <span className="text-sm">1 sao</span>
            <span className="text-sm">5 sao</span>
          </div>
          <Slider defaultValue={[1, 5]} min={1} max={5} step={1} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-from">Từ ngày</Label>
          <Input id="date-from" type="date" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-to">Đến ngày</Label>
          <Input id="date-to" type="date" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Trạng thái</Label>
          <Select defaultValue="all">
            <SelectTrigger id="status">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full">Áp dụng bộ lọc</Button>
      </CardContent>
    </Card>
  )
}

