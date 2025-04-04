import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-16" />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="border-b">
                <div className="flex">
                  <Skeleton className="h-10 w-24 m-1" />
                  <Skeleton className="h-10 w-24 m-1" />
                  <Skeleton className="h-10 w-24 m-1" />
                  <Skeleton className="h-10 w-24 m-1" />
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-40 mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="border-b">
                <div className="flex">
                  <Skeleton className="h-10 w-24 m-1" />
                  <Skeleton className="h-10 w-24 m-1" />
                  <Skeleton className="h-10 w-24 m-1" />
                  <Skeleton className="h-10 w-24 m-1" />
                </div>
              </div>

              <div className="p-4 md:p-6">
                <div className="overflow-x-auto">
                  <div className="space-y-4">
                    <div className="flex">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-32 mx-4" />
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16 mx-4" />
                      <Skeleton className="h-6 w-24" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="ml-4 space-y-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-5 w-24 ml-auto" />
                        <Skeleton className="h-5 w-8 mx-8" />
                        <Skeleton className="h-5 w-24" />
                      </div>

                      <div className="flex items-center">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="ml-4 space-y-2">
                          <Skeleton className="h-5 w-40" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-5 w-24 ml-auto" />
                        <Skeleton className="h-5 w-8 mx-8" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <Skeleton className="h-32 w-full" />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <Skeleton className="h-32 w-full" />
              </div>

              <Separator />

              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-sm" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative border-l border-muted pl-6">
                  <Skeleton className="absolute h-6 w-6 rounded-full -left-3" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>

                <div className="relative border-l border-muted pl-6">
                  <Skeleton className="absolute h-6 w-6 rounded-full -left-3" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>

                <div className="relative border-l border-muted pl-6">
                  <Skeleton className="absolute h-6 w-6 rounded-full -left-3" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>

                <div className="relative border-l border-muted pl-6">
                  <Skeleton className="absolute h-6 w-6 rounded-full -left-3" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

