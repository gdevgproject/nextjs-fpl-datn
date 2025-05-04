import { AdminLayout } from "@/features/admin/shared/components/admin-layout";
import { DashboardOverview } from "@/features/admin/dashboard/components/dashboard-overview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="orders" disabled>Đơn hàng</TabsTrigger>
            <TabsTrigger value="products" disabled>Sản phẩm & Tồn kho</TabsTrigger>
            <TabsTrigger value="customers" disabled>Khách hàng</TabsTrigger>
            <TabsTrigger value="promotions" disabled>Khuyến mãi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <DashboardOverview />
          </TabsContent>
          
          <TabsContent value="orders">
            <p className="text-muted-foreground">Chức năng đang phát triển</p>
          </TabsContent>
          
          <TabsContent value="products">
            <p className="text-muted-foreground">Chức năng đang phát triển</p>
          </TabsContent>
          
          <TabsContent value="customers">
            <p className="text-muted-foreground">Chức năng đang phát triển</p>
          </TabsContent>
          
          <TabsContent value="promotions">
            <p className="text-muted-foreground">Chức năng đang phát triển</p>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
