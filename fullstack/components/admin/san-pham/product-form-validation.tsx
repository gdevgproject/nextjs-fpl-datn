"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ValidationError {
  field: string
  message: string
  severity: "error" | "warning"
  tab?: string
  section?: string
}

interface ValidationSummary {
  errors: number
  warnings: number
  completionPercentage: number
  sections: {
    [key: string]: {
      completionPercentage: number
      errors: number
      warnings: number
    }
  }
}

interface ProductFormValidationProps {
  errors: ValidationError[]
  summary: ValidationSummary
  onTabChange?: (tab: string) => void
}

export function ProductFormValidation({ errors, summary, onTabChange }: ProductFormValidationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Nhóm lỗi theo tab và section
  const errorsByTabAndSection = errors.reduce(
    (acc, error) => {
      const tab = error.tab || "Khác"
      const section = error.section || "Chung"

      if (!acc[tab]) {
        acc[tab] = {}
      }

      if (!acc[tab][section]) {
        acc[tab][section] = []
      }

      acc[tab][section].push(error)
      return acc
    },
    {} as Record<string, Record<string, ValidationError[]>>,
  )

  // Tự động mở validation khi có lỗi
  useEffect(() => {
    if (errors.length > 0 && !isOpen) {
      setIsOpen(true)

      // Tự động chọn tab đầu tiên có lỗi
      if (!activeTab && Object.keys(errorsByTabAndSection).length > 0) {
        setActiveTab(Object.keys(errorsByTabAndSection)[0])

        // Tự động chọn section đầu tiên có lỗi
        const firstTab = Object.keys(errorsByTabAndSection)[0]
        if (Object.keys(errorsByTabAndSection[firstTab]).length > 0) {
          setActiveSection(Object.keys(errorsByTabAndSection[firstTab])[0])
        }
      }
    }
  }, [errors, isOpen, activeTab, errorsByTabAndSection])

  // Hiển thị màu dựa trên mức độ hoàn thành
  const getCompletionColor = () => {
    if (summary.completionPercentage < 50) return "bg-red-500"
    if (summary.completionPercentage < 80) return "bg-amber-500"
    return "bg-green-500"
  }

  // Hiển thị icon dựa trên mức độ hoàn thành
  const getCompletionIcon = () => {
    if (summary.errors > 0) return <AlertCircle className="h-4 w-4 text-red-500" />
    if (summary.warnings > 0) return <AlertTriangle className="h-4 w-4 text-amber-500" />
    return <CheckCircle2 className="h-4 w-4 text-green-500" />
  }

  // Hiển thị thông báo dựa trên mức độ hoàn thành
  const getCompletionMessage = () => {
    if (summary.errors > 0) {
      return `${summary.errors} lỗi cần sửa trước khi lưu`
    }
    if (summary.warnings > 0) {
      return `${summary.warnings} cảnh báo có thể ảnh hưởng đến hiển thị sản phẩm`
    }
    if (summary.completionPercentage < 100) {
      return "Sản phẩm đã sẵn sàng để lưu, nhưng một số thông tin tùy chọn chưa được điền"
    }
    return "Sản phẩm đã hoàn tất và sẵn sàng để lưu"
  }

  // Xử lý khi click vào tab
  const handleTabClick = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab)
    }
  }

  // Hiển thị danh sách lỗi
  const renderErrorList = () => {
    return Object.entries(errorsByTabAndSection).map(([tab, sections]) => (
      <Collapsible
        key={tab}
        open={activeTab === tab}
        onOpenChange={() => setActiveTab(activeTab === tab ? null : tab)}
        className="mb-2"
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal" size="sm">
            <div className="flex items-center">
              <span className="font-medium">{tab}</span>
              <div className="ml-2 flex space-x-1">
                {Object.values(sections).some((errors) => errors.some((e) => e.severity === "error")) && (
                  <Badge variant="destructive" className="text-xs">
                    {
                      Object.values(sections)
                        .flat()
                        .filter((e) => e.severity === "error").length
                    }{" "}
                    lỗi
                  </Badge>
                )}
                {Object.values(sections).some((errors) => errors.some((e) => e.severity === "warning")) && (
                  <Badge variant="outline" className="border-amber-500 text-xs text-amber-500">
                    {
                      Object.values(sections)
                        .flat()
                        .filter((e) => e.severity === "warning").length
                    }{" "}
                    cảnh báo
                  </Badge>
                )}
              </div>
            </div>
            {activeTab === tab ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          {Object.entries(sections).map(([section, sectionErrors]) => (
            <Collapsible
              key={section}
              open={activeSection === section}
              onOpenChange={() => setActiveSection(activeSection === section ? null : section)}
              className="mb-2 ml-4"
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-2 py-1 font-normal" size="sm">
                  <div className="flex items-center">
                    <span>{section}</span>
                    <div className="ml-2 flex space-x-1">
                      {sectionErrors.some((e) => e.severity === "error") && (
                        <Badge variant="destructive" className="text-xs">
                          {sectionErrors.filter((e) => e.severity === "error").length} lỗi
                        </Badge>
                      )}
                      {sectionErrors.some((e) => e.severity === "warning") && (
                        <Badge variant="outline" className="border-amber-500 text-xs text-amber-500">
                          {sectionErrors.filter((e) => e.severity === "warning").length} cảnh báo
                        </Badge>
                      )}
                    </div>
                  </div>
                  {activeSection === section ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                {sectionErrors.map((error, index) => (
                  <Alert key={index} variant={error.severity === "error" ? "destructive" : "default"} className="mb-2">
                    {error.severity === "error" ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertTitle className="text-sm">{error.field}</AlertTitle>
                    <AlertDescription className="text-xs">{error.message}</AlertDescription>
                  </Alert>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
          <div className="mt-2 flex justify-end">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={() => handleTabClick(tab)}>
                    Đi đến tab
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chuyển đến tab để sửa lỗi</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CollapsibleContent>
      </Collapsible>
    ))
  }

  // Hiển thị tiến trình hoàn thành theo section
  const renderSectionProgress = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Tiến trình hoàn thành</h3>
        {Object.entries(summary.sections).map(([section, data]) => (
          <div key={section} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>{section}</span>
              <span className="flex items-center">
                {data.errors > 0 ? (
                  <AlertCircle className="mr-1 h-3 w-3 text-red-500" />
                ) : data.warnings > 0 ? (
                  <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" />
                ) : (
                  <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                )}
                {data.completionPercentage}%
              </span>
            </div>
            <Progress
              value={data.completionPercentage}
              className={data.errors > 0 ? "bg-red-100" : data.warnings > 0 ? "bg-amber-100" : "bg-green-100"}
              indicatorClassName={data.errors > 0 ? "bg-red-500" : data.warnings > 0 ? "bg-amber-500" : "bg-green-500"}
            />
          </div>
        ))}
      </div>
    )
  }

  // Hiển thị trên desktop
  if (isDesktop) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Kiểm tra thông tin sản phẩm</span>
            <span className="text-sm font-normal flex items-center gap-1">
              {getCompletionIcon()}
              {summary.completionPercentage}% hoàn thành
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={summary.completionPercentage} className={getCompletionColor()} />

            <Alert variant={summary.errors > 0 ? "destructive" : summary.warnings > 0 ? "default" : "success"}>
              {getCompletionIcon()}
              <AlertTitle>Trạng thái</AlertTitle>
              <AlertDescription>{getCompletionMessage()}</AlertDescription>
            </Alert>

            <Tabs defaultValue="errors" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="errors" className="flex-1">
                  Lỗi & Cảnh báo
                  {(summary.errors > 0 || summary.warnings > 0) && (
                    <Badge variant={summary.errors > 0 ? "destructive" : "outline"} className="ml-2">
                      {summary.errors + summary.warnings}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="progress" className="flex-1">
                  Tiến trình
                </TabsTrigger>
              </TabsList>
              <TabsContent value="errors">
                {errors.length > 0 ? (
                  <ScrollArea className="h-[300px]">{renderErrorList()}</ScrollArea>
                ) : (
                  <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed p-4">
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                      Không có lỗi hoặc cảnh báo nào
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="progress">
                <ScrollArea className="h-[300px]">{renderSectionProgress()}</ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Hiển thị trên mobile và tablet
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Kiểm tra thông tin</span>
          <span className="text-sm font-normal flex items-center gap-1">
            {getCompletionIcon()}
            {summary.completionPercentage}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={summary.completionPercentage} className={getCompletionColor()} />

          <Alert variant={summary.errors > 0 ? "destructive" : summary.warnings > 0 ? "default" : "success"}>
            {getCompletionIcon()}
            <AlertDescription>{getCompletionMessage()}</AlertDescription>
          </Alert>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>Chi tiết lỗi và tiến trình</span>
                <Badge variant={summary.errors > 0 ? "destructive" : "outline"} className="ml-2">
                  {summary.errors + summary.warnings}
                </Badge>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Kiểm tra thông tin sản phẩm</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-4">
                <Tabs defaultValue="errors" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="errors" className="flex-1">
                      Lỗi & Cảnh báo
                      {(summary.errors > 0 || summary.warnings > 0) && (
                        <Badge variant={summary.errors > 0 ? "destructive" : "outline"} className="ml-2">
                          {summary.errors + summary.warnings}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="progress" className="flex-1">
                      Tiến trình
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="errors">
                    {errors.length > 0 ? (
                      <ScrollArea className="h-[50vh]">{renderErrorList()}</ScrollArea>
                    ) : (
                      <div className="flex h-[100px] items-center justify-center rounded-md border border-dashed p-4">
                        <div className="flex items-center text-muted-foreground">
                          <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                          Không có lỗi hoặc cảnh báo nào
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="progress">
                    <ScrollArea className="h-[50vh]">{renderSectionProgress()}</ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </CardContent>
    </Card>
  )
}

