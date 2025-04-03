import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ScentPreviewProps = {
  name: string
  description?: string
  group?: string
  groupColor?: string
}

export function ScentPreview({ name, description, group, groupColor = "#3b82f6" }: ScentPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Xem trước mùi hương</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="product">
          <TabsList className="mb-4">
            <TabsTrigger value="product">Chi tiết sản phẩm</TabsTrigger>
            <TabsTrigger value="filter">Bộ lọc</TabsTrigger>
            <TabsTrigger value="pyramid">Kim tự tháp hương</TabsTrigger>
          </TabsList>

          <TabsContent value="product">
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Thành phần mùi hương</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm text-muted-foreground mb-1">Hương đầu</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-gray-100">
                      Cam Bergamot
                    </Badge>
                    <Badge
                      variant="outline"
                      className="font-normal"
                      style={{
                        backgroundColor: `${groupColor}20`,
                        color: groupColor,
                        borderColor: `${groupColor}40`,
                      }}
                    >
                      {name}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100">
                      Chanh
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm text-muted-foreground mb-1">Hương giữa</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-gray-100">
                      Hoa nhài
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100">
                      Hoa oải hương
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm text-muted-foreground mb-1">Hương cuối</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-gray-100">
                      Gỗ đàn hương
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100">
                      Xạ hương
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="filter">
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="font-medium mb-2">Bộ lọc mùi hương</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="filter-1" className="mr-2" />
                  <label htmlFor="filter-1" className="text-sm">
                    Hoa hồng
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="filter-2" className="mr-2" />
                  <label htmlFor="filter-2" className="text-sm">
                    Hoa nhài
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="filter-3" className="mr-2" checked readOnly />
                  <label htmlFor="filter-3" className="text-sm font-medium">
                    {name}
                  </label>
                  {group && (
                    <Badge
                      variant="outline"
                      className="ml-2 font-normal text-xs"
                      style={{
                        backgroundColor: `${groupColor}20`,
                        color: groupColor,
                        borderColor: `${groupColor}40`,
                      }}
                    >
                      {group}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="filter-4" className="mr-2" />
                  <label htmlFor="filter-4" className="text-sm">
                    Gỗ đàn hương
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pyramid">
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="font-medium mb-3">Kim tự tháp hương</h3>
              <div className="relative mx-auto" style={{ width: "200px", height: "200px" }}>
                {/* Top notes */}
                <div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-1/3 flex items-center justify-center"
                  style={{
                    backgroundColor: `${groupColor}30`,
                    borderTopLeftRadius: "100px",
                    borderTopRightRadius: "100px",
                    borderBottomLeftRadius: "0",
                    borderBottomRightRadius: "0",
                  }}
                >
                  <span className="text-xs font-medium" style={{ color: groupColor }}>
                    {name}
                  </span>
                </div>

                {/* Middle notes */}
                <div
                  className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-2/3 h-1/3 flex items-center justify-center"
                  style={{
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  <span className="text-xs text-gray-600">Hương giữa</span>
                </div>

                {/* Base notes */}
                <div
                  className="absolute top-2/3 left-1/2 transform -translate-x-1/2 w-full h-1/3 flex items-center justify-center"
                  style={{
                    backgroundColor: "#e5e7eb",
                  }}
                >
                  <span className="text-xs text-gray-600">Hương cuối</span>
                </div>
              </div>

              <div className="mt-4 text-sm text-center text-muted-foreground">
                {description || `Mùi hương ${name} thường được sử dụng làm hương đầu trong các sản phẩm nước hoa.`}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

