import { categories } from "@/lib/mockData";
import CategoryMenu from "../navigation/CategoryMenu";

const Navigation = () => {
  return (
    <div className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-8">
          {/* Logo và các menu item khác */}
          {/* ...existing code... */}

          {/* Category Menu */}
          <div className="relative group">
            <button className="px-4 py-2 hover:text-primary-600">
              Danh mục
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block z-50">
              <CategoryMenu categories={categories} />
            </div>
          </div>

          {/* Các menu item khác */}
          {/* ...existing code... */}
        </div>
      </div>
    </div>
  );
};

export default Navigation;
