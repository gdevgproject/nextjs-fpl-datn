"use client";

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { categories, brands } from "@/lib/mockData";

export default function Navigation() {
  // Lọc danh mục cha (parentId === null)
  const parentCategories = categories.filter((cat) => cat.parentId === null);

  // Hàm lấy danh mục con của một danh mục cha
  const getChildCategories = (parentId: string) => {
    return categories.filter((cat) => cat.parentId === parentId);
  };

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 flex justify-center">
        <NavigationMenu>
          <NavigationMenuList className="flex gap-6">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/" className="font-medium">
                  Trang chủ
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/products" className="font-medium">
                  Sản phẩm
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Danh mục</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[500px] p-4">
                  {parentCategories.map((parent) => (
                    <div key={parent.id} className="mb-4">
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/categories/${parent.id}`}
                          className="block text-lg font-medium text-primary mb-2 hover:text-primary/80"
                        >
                          {parent.name}
                        </Link>
                      </NavigationMenuLink>
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        {getChildCategories(parent.id).map((child) => (
                          <NavigationMenuLink key={child.id} asChild>
                            <Link
                              href={`/categories/${child.id}`}
                              className="block text-sm text-muted-foreground hover:text-primary p-2 rounded-md hover:bg-accent"
                            >
                              {child.name}
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Thương hiệu</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                  {brands.map((brand) => (
                    <li key={brand.id}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/brands/${brand.id}`}
                          className="block select-none rounded-md p-3 hover:bg-accent"
                        >
                          <div className="font-medium">{brand.name}</div>
                          <p className="text-sm text-muted-foreground">
                            {brand.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/deals" className="font-medium">
                  Khuyến mãi
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}
