"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, Clock, Heart, X } from "lucide-react"

// Dữ liệu mẫu
const trendingSearches = [
  "Nước hoa nam mùa hè",
  "Chanel No.5",
  "Tom Ford Black Orchid",
  "Nước hoa nữ lưu hương lâu",
  "Dior Sauvage",
  "Versace Eros",
  "Gucci Bloom",
  "Nước hoa unisex",
]

const trendingCategories = [
  { name: "Nước hoa Nam", slug: "nuoc-hoa-nam" },
  { name: "Nước hoa Nữ", slug: "nuoc-hoa-nu" },
  { name: "Nước hoa Unisex", slug: "nuoc-hoa-unisex" },
  { name: "Nước hoa Niche", slug: "nuoc-hoa-niche" },
  { name: "Giftset", slug: "giftset" },
  { name: "Nước hoa Mini", slug: "nuoc-hoa-mini" },
]

const trendingBrands = [
  { name: "Dior", slug: "dior" },
  { name: "Chanel", slug: "chanel" },
  { name: "Tom Ford", slug: "tom-ford" },
  { name: "Versace", slug: "versace" },
  { name: "Gucci", slug: "gucci" },
  { name: "Yves Saint Laurent", slug: "yves-saint-laurent" },
]

export function SearchSuggestions() {
  // Giả lập lịch sử tìm kiếm
  const searchHistory = ["Nước hoa nam", "Chanel", "Dior Sauvage", "Nước hoa mini"]

  // Giả lập sản phẩm yêu thích
  const favoriteProducts = [
    { id: 1, name: "Dior Sauvage EDP", slug: "dior-sauvage-edp" },
    { id: 2, name: "Chanel Coco Mademoiselle", slug: "chanel-coco-mademoiselle" },
    { id: 3, name: "Tom Ford Black Orchid", slug: "tom-ford-black-orchid" },
  ]

  return (
    <div className="space-y-8">
      <Tabs defaultValue="trending">
        <TabsList className="mb-6">
          <TabsTrigger value="trending">
            <TrendingUp className="h-4 w-4 mr-2" />
            Xu hướng
          </TabsTrigger>
          <TabsTrigger value="history">
            <Clock className="h-4 w-4 mr-2" />
            Lịch sử tìm kiếm
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="h-4 w-4 mr-2" />
            Sản phẩm yêu thích
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-lg mb-4">Từ khóa phổ biến</h3>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((term, index) => (
                    <Button key={index} variant="outline" size="sm" className="rounded-full" asChild>
                      <Link href={`/tim-kiem?q=${encodeURIComponent(term)}`}>
                        <Search className="h-3.5 w-3.5 mr-1.5" />
                        {term}
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-lg mb-4">Danh mục nổi bật</h3>
                <div className="space-y-2">
                  {trendingCategories.map((category, index) => (
                    <Button key={index} variant="ghost" className="w-full justify-start px-2 h-9" asChild>
                      <Link href={`/danh-muc/${category.slug}`}>{category.name}</Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium text-lg mb-4">Thương hiệu nổi bật</h3>
                <div className="space-y-2">
                  {trendingBrands.map((brand, index) => (
                    <Button key={index} variant="ghost" className="w-full justify-start px-2 h-9" asChild>
                      <Link href={`/thuong-hieu/${brand.slug}`}>{brand.name}</Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          {searchHistory.length > 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">Lịch sử tìm kiếm của bạn</h3>
                  <Button variant="ghost" size="sm">
                    Xóa lịch sử
                  </Button>
                </div>
                <div className="space-y-2">
                  {searchHistory.map((term, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Button variant="ghost" className="w-full justify-start px-2 h-9" asChild>
                        <Link href={`/tim-kiem?q=${encodeURIComponent(term)}`}>
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          {term}
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Xóa</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có lịch sử tìm kiếm</h3>
              <p className="text-muted-foreground">Lịch sử tìm kiếm của bạn sẽ xuất hiện ở đây</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          {favoriteProducts.length > 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">Sản phẩm yêu thích của bạn</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/tai-khoan/yeu-thich">Xem tất cả</Link>
                  </Button>
                </div>
                <div className="space-y-2">
                  {favoriteProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <Button variant="ghost" className="w-full justify-start px-2 h-9" asChild>
                        <Link href={`/san-pham/${product.slug}`}>
                          <Heart className="h-4 w-4 mr-2 text-red-500 fill-red-500" />
                          {product.name}
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có sản phẩm yêu thích</h3>
              <p className="text-muted-foreground mb-4">Thêm sản phẩm vào danh sách yêu thích để xem ở đây</p>
              <Button asChild>
                <Link href="/san-pham">Khám phá sản phẩm</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

