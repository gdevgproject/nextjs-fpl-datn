import { Category } from "@/lib/mockData";
import Link from "next/link";
import { useState } from "react";

interface CategoryMenuProps {
  categories: Category[];
}

const CategoryMenu = ({ categories }: CategoryMenuProps) => {
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  // Lọc ra danh mục gốc (level 0)
  const rootCategories = categories.filter((cat) => cat.level === 0);

  // Lấy danh mục con của một danh mục
  const getChildCategories = (parentId: string) => {
    return categories.filter((cat) => cat.parentId === parentId);
  };

  // Xử lý mở/đóng danh mục
  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Render một danh mục và các danh mục con của nó
  const renderCategory = (category: Category) => {
    const childCategories = getChildCategories(category.id);
    const hasChildren = childCategories.length > 0;
    const isOpen = openCategories.includes(category.id);

    // Chuẩn hóa slug
    const categorySlug = category.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    return (
      <div key={category.id} className="relative group">
        <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-100">
          <Link
            href={`/categories/${categorySlug}`}
            className="flex-grow hover:text-primary-600"
          >
            {category.name}
          </Link>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent link click when clicking the button
                toggleCategory(category.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <svg
                className={`w-4 h-4 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
        {hasChildren && isOpen && (
          <div className="pl-4 border-l">
            {childCategories.map((child) => renderCategory(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="w-64 bg-white shadow rounded">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Danh mục sản phẩm</h2>
      </div>
      <div className="py-2">
        {rootCategories.map((category) => renderCategory(category))}
      </div>
    </nav>
  );
};

export default CategoryMenu;
