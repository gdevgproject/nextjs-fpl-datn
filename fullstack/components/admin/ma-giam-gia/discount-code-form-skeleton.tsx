"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DiscountCodeFormSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <Tabs defaultValue="basic">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="usage">Lịch sử sử dụng</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-40" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-4 w-48" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-60" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-28" />
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>

                  <Skeleton className="h-[1px] w-full" />

                  <div>
                    <Skeleton className="h-6 w-40 mb-4" />
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="w-full lg:w-80 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-[180px] w-full rounded-md" />

            <div className="mt-6 space-y-4">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-16 w-full rounded-md" />
              </div>

              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-32 w-full rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

