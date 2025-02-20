"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Menu, Heart, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Category, Brand } from "@/lib/mockData";

interface HeaderProps {
  categories: Category[];
  brands: Brand[];
}

export default function Header({ categories, brands }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchTerm);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="Perfume Paradise"
            width={40}
            height={40}
          />
          <span className="ml-2 text-2xl font-bold text-primary hidden md:inline">
            Perfume Paradise
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative">
          <Input
            type="search"
            placeholder="Search perfumes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </form>

        <div className="flex items-center space-x-4">
          <Link href="/favorites">
            <Button variant="ghost" size="icon">
              <Heart className="h-6 w-6" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-6 w-6" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link href="/login">Login</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/register">Register</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4">
                <Link href="/categories" className="text-lg font-semibold">
                  Categories
                </Link>
                <Link href="/brands" className="text-lg font-semibold">
                  Brands
                </Link>
                <Link href="/deals" className="text-lg font-semibold">
                  Deals
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {/* Main navigation */}
      <nav className="bg-gray-100 shadow-md">
        <div className="container mx-auto px-4">
          <ul className="flex items-center space-x-6 py-3">
            <li>
              <Link href="/" className="hover:text-primary">
                Trang chủ
              </Link>
            </li>
            {/* Categories dropdown */}
            <li className="relative group">
              <button className="hover:text-primary">
                Danh mục
                <span className="ml-1">▼</span>
              </button>
              <ul className="absolute hidden group-hover:block bg-white shadow-lg p-4 w-48">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.id}`}
                      className="block py-2 hover:text-primary"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {/* Brands dropdown */}
            <li className="relative group">
              <button className="hover:text-primary">
                Thương hiệu
                <span className="ml-1">▼</span>
              </button>
              <ul className="absolute hidden group-hover:block bg-white shadow-lg p-4 w-48">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <Link
                      href={`/brand/${brand.id}`}
                      className="block py-2 hover:text-primary"
                    >
                      {brand.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link href="/sale" className="hover:text-primary">
                Khuyến mãi
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary">
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
