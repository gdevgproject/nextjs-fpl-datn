import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScentList } from "@/components/admin/thuoc-tinh/scent-list"
import { ScentGroupManager } from "@/components/admin/thuoc-tinh/scent-group-manager"
import { ScentStats } from "@/components/admin/thuoc-tinh/scent-stats"
import { ScentAnalytics } from "@/components/admin/thuoc-tinh/scent-analytics"
import { IngredientList } from "@/components/admin/thuoc-tinh/ingredient-list"
import { IngredientStats } from "@/components/admin/thuoc-tinh/ingredient-stats"
import { IngredientAnalytics } from "@/components/admin/thuoc-tinh/ingredient-analytics"
import { ProductLabelList } from "@/components/admin/thuoc-tinh/product-label-list"
import { PageHeader } from "@/components/admin/common/page-header"

export const metadata: Metadata = {
  title: "Quản lý thuộc tính sản phẩm | MyBeauty Admin",
  description: "Quản lý các thuộc tính của sản phẩm như mùi hương, thành phần, nhãn",
}

export default function ProductAttributesPage() {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <PageHeader
        title="Thuộc tính sản phẩm"
        description="Quản lý các thuộc tính của sản phẩm như mùi hương, thành phần, nhãn"
      />
      <Separator />

      <Tabs defaultValue="scents" className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="scents">Mùi hương</TabsTrigger>
          <TabsTrigger value="scent-groups">Nhóm mùi hương</TabsTrigger>
          <TabsTrigger value="ingredients">Thành phần</TabsTrigger>
          <TabsTrigger value="labels">Nhãn sản phẩm</TabsTrigger>
        </TabsList>

        <TabsContent value="scents" className="mt-0 space-y-4">
          <ScentStats />
          <div className="grid gap-4 md:grid-cols-2">
            <ScentAnalytics />
          </div>
          <ScentList />
        </TabsContent>

        <TabsContent value="scent-groups" className="mt-0 space-y-4">
          <ScentGroupManager />
        </TabsContent>

        <TabsContent value="ingredients" className="mt-0 space-y-4">
          <IngredientStats />
          <IngredientAnalytics />
          <IngredientList />
        </TabsContent>

        <TabsContent value="labels" className="mt-0">
          <ProductLabelList />
        </TabsContent>
      </Tabs>
    </div>
  )
}

