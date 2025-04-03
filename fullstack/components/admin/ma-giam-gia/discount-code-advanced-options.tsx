"use client"

import { useState } from "react"
import { Info } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DiscountCodeAdvancedOptions() {
  const [limitPerUser, setLimitPerUser] = useState(false)
  const [limitPerUserCount, setLimitPerUserCount] = useState("1")
  const [firstTimeOnly, setFirstTimeOnly] = useState(false)
  const [specificProducts, setSpecificProducts] = useState(false)
  const [specificCategories, setSpecificCategories] = useState(false)
  const [excludeProducts, setExcludeProducts] = useState(false)
  const [excludeCategories, setExcludeCategories] = useState(false)
  const [combinable, setCombinable] = useState("no")

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Các tùy chọn nâng cao giúp bạn kiểm soát chi tiết hơn cách mã giảm giá hoạt động.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="limit-per-user" className="text-sm font-medium">
                  Giới hạn số lần sử dụng cho mỗi người dùng
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Giới hạn số lần một người dùng có thể sử dụng mã giảm giá này</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Switch id="limit-per-user" checked={limitPerUser} onCheckedChange={setLimitPerUser} />
            </div>

            {limitPerUser && (
              <div className="pl-6">
                <Label htmlFor="limit-per-user-count" className="text-sm">
                  Số lần tối đa mỗi người dùng có thể sử dụng
                </Label>
                <Input
                  id="limit-per-user-count"
                  type="number"
                  min="1"
                  value={limitPerUserCount}
                  onChange={(e) => setLimitPerUserCount(e.target.value)}
                  className="mt-1 w-full max-w-[200px]"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="first-time-only" className="text-sm font-medium">
                Chỉ áp dụng cho đơn hàng đầu tiên
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Mã giảm giá chỉ áp dụng cho người dùng chưa từng đặt hàng</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch id="first-time-only" checked={firstTimeOnly} onCheckedChange={setFirstTimeOnly} />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Phạm vi áp dụng</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="specific-products" className="text-sm">
                  Chỉ áp dụng cho sản phẩm cụ thể
                </Label>
                <Switch id="specific-products" checked={specificProducts} onCheckedChange={setSpecificProducts} />
              </div>

              {specificProducts && (
                <div className="pl-6">
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn sản phẩm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả sản phẩm</SelectItem>
                      <SelectItem value="product1">Nước hoa Chanel No.5</SelectItem>
                      <SelectItem value="product2">Nước hoa Dior Sauvage</SelectItem>
                      <SelectItem value="product3">Nước hoa Gucci Bloom</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Có thể chọn nhiều sản phẩm</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="specific-categories" className="text-sm">
                  Chỉ áp dụng cho danh mục cụ thể
                </Label>
                <Switch id="specific-categories" checked={specificCategories} onCheckedChange={setSpecificCategories} />
              </div>

              {specificCategories && (
                <div className="pl-6">
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      <SelectItem value="category1">Nước hoa nam</SelectItem>
                      <SelectItem value="category2">Nước hoa nữ</SelectItem>
                      <SelectItem value="category3">Nước hoa unisex</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Có thể chọn nhiều danh mục</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="exclude-products" className="text-sm">
                  Loại trừ sản phẩm cụ thể
                </Label>
                <Switch id="exclude-products" checked={excludeProducts} onCheckedChange={setExcludeProducts} />
              </div>

              {excludeProducts && (
                <div className="pl-6">
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn sản phẩm loại trừ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product1">Nước hoa Chanel No.5</SelectItem>
                      <SelectItem value="product2">Nước hoa Dior Sauvage</SelectItem>
                      <SelectItem value="product3">Nước hoa Gucci Bloom</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Có thể chọn nhiều sản phẩm</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="exclude-categories" className="text-sm">
                  Loại trừ danh mục cụ thể
                </Label>
                <Switch id="exclude-categories" checked={excludeCategories} onCheckedChange={setExcludeCategories} />
              </div>

              {excludeCategories && (
                <div className="pl-6">
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn danh mục loại trừ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category1">Nước hoa nam</SelectItem>
                      <SelectItem value="category2">Nước hoa nữ</SelectItem>
                      <SelectItem value="category3">Nước hoa unisex</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Có thể chọn nhiều danh mục</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Kết hợp với mã giảm giá khác</Label>
            <RadioGroup value={combinable} onValueChange={setCombinable}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="combinable-yes" />
                <Label htmlFor="combinable-yes" className="text-sm">
                  Có, cho phép kết hợp với mã giảm giá khác
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="combinable-no" />
                <Label htmlFor="combinable-no" className="text-sm">
                  Không, không thể kết hợp với mã giảm giá khác
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

