import { Suspense } from "react"
import type { Metadata } from "next"
import { SearchResults } from "@/components/tim-kiem/search-results"
import { SearchForm } from "@/components/tim-kiem/search-form"
import { SearchSuggestions } from "@/components/tim-kiem/search-suggestions"
import { SearchFilters } from "@/components/tim-kiem/search-filters"
import { SearchSkeleton } from "@/components/tim-kiem/search-skeleton"
import { PageContainer } from "@/components/layout/page-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Tìm kiếm sản phẩm",
  description: "Tìm kiếm sản phẩm nước hoa yêu thích của bạn",
}

interface SearchPageProps {
  searchParams: {
    q?: string
    page?: string
    sort?: string
    category?: string
    brand?: string
    gender?: string
    price_min?: string
    price_max?: string
    rating?: string
    tab?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  const page = Number(searchParams.page) || 1
  const sort = searchParams.sort || "relevance"
  const activeTab = searchParams.tab || "all"

  return (
    <PageContainer>
      <div className="py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">Tìm kiếm sản phẩm</h1>

        <div className="mb-8">
          <SearchForm initialQuery={query} />
        </div>

        {query ? (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            <div className="hidden lg:block">
              <SearchFilters
                query={query}
                selectedCategory={searchParams.category}
                selectedBrand={searchParams.brand}
                selectedGender={searchParams.gender}
                selectedPriceMin={searchParams.price_min}
                selectedPriceMax={searchParams.price_max}
                selectedRating={searchParams.rating}
              />
            </div>

            <div>
              <Tabs defaultValue={activeTab} className="mb-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Tất cả</TabsTrigger>
                  <TabsTrigger value="products">Sản phẩm</TabsTrigger>
                  <TabsTrigger value="brands">Thương hiệu</TabsTrigger>
                  <TabsTrigger value="categories">Danh mục</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <Suspense fallback={<SearchSkeleton />}>
                    <SearchResults query={query} page={page} sort={sort} searchParams={searchParams} />
                  </Suspense>
                </TabsContent>

                <TabsContent value="products">
                  <Suspense fallback={<SearchSkeleton />}>
                    <SearchResults
                      query={query}
                      page={page}
                      sort={sort}
                      searchParams={{ ...searchParams, type: "products" }}
                    />
                  </Suspense>
                </TabsContent>

                <TabsContent value="brands">
                  <Suspense fallback={<SearchSkeleton />}>
                    <SearchResults
                      query={query}
                      page={page}
                      sort={sort}
                      searchParams={{ ...searchParams, type: "brands" }}
                    />
                  </Suspense>
                </TabsContent>

                <TabsContent value="categories">
                  <Suspense fallback={<SearchSkeleton />}>
                    <SearchResults
                      query={query}
                      page={page}
                      sort={sort}
                      searchParams={{ ...searchParams, type: "categories" }}
                    />
                  </Suspense>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <SearchSuggestions />
        )}
      </div>
    </PageContainer>
  )
}

