import { CategoryManagement } from "@/features/admin/categories/components/category-management";
import { AdminLayout } from "@/features/admin/shared/components/admin-layout";

export default function CategoriesPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Danh mục sản phẩm
          </h1>
          <p className="text-muted-foreground">
            Quản lý danh mục sản phẩm của cửa hàng. Danh mục có thể được sắp xếp
            theo cấp bậc (danh mục cha-con).
          </p>
        </div>
        <CategoryManagement />
      </div>
    </AdminLayout>
  );
}
