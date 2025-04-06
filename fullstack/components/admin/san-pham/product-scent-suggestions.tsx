"use client"

import { useState } from "react"
import { Lightbulb } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface ProductScent {
  id: string
  scent_id: string
  scent_name: string
  scent_type: "top" | "middle" | "base"
  intensity?: number
}

interface ScentSuggestion {
  id: string
  name: string
  description: string
  scents: ProductScent[]
}

interface ProductScentSuggestionsProps {
  onSelect: (scents: ProductScent[]) => void
}

export function ProductScentSuggestions({ onSelect }: ProductScentSuggestionsProps) {
  const [activeTab, setActiveTab] = useState("fresh")

  // Danh sách gợi ý mẫu
  const suggestions: ScentSuggestion[] = [
    {
      id: "fresh",
      name: "Tươi mát",
      description: "Hương thơm tươi mát, sảng khoái, phù hợp cho mùa hè và sử dụng hàng ngày",
      scents: [
        { id: "fresh-1", scent_id: "8", scent_name: "Cam bergamot", scent_type: "top", intensity: 4 },
        { id: "fresh-2", scent_id: "9", scent_name: "Chanh", scent_type: "top", intensity: 3 },
        { id: "fresh-3", scent_id: "4", scent_name: "Hoa oải hương", scent_type: "middle", intensity: 3 },
        { id: "fresh-4", scent_id: "6", scent_name: "Gỗ đàn hương", scent_type: "base", intensity: 2 },
      ],
    },
    {
      id: "floral",
      name: "Hoa cỏ",
      description: "Hương thơm ngọt ngào, nữ tính từ các loại hoa, phù hợp cho phụ nữ",
      scents: [
        { id: "floral-1", scent_id: "8", scent_name: "Cam bergamot", scent_type: "top", intensity: 2 },
        { id: "floral-2", scent_id: "2", scent_name: "Hoa hồng", scent_type: "middle", intensity: 4 },
        { id: "floral-3", scent_id: "3", scent_name: "Hoa nhài", scent_type: "middle", intensity: 3 },
        { id: "floral-4", scent_id: "5", scent_name: "Vani", scent_type: "base", intensity: 3 },
      ],
    },
    {
      id: "woody",
      name: "Gỗ",
      description: "Hương thơm ấm áp, nam tính từ các loại gỗ, phù hợp cho nam giới",
      scents: [
        { id: "woody-1", scent_id: "10", scent_name: "Quế", scent_type: "top", intensity: 3 },
        { id: "woody-2", scent_id: "4", scent_name: "Hoa oải hương", scent_type: "middle", intensity: 2 },
        { id: "woody-3", scent_id: "6", scent_name: "Gỗ đàn hương", scent_type: "base", intensity: 4 },
        { id: "woody-4", scent_id: "7", scent_name: "Xạ hương", scent_type: "base", intensity: 3 },
      ],
    },
    {
      id: "oriental",
      name: "Phương Đông",
      description: "Hương thơm ấm áp, gợi cảm, phù hợp cho buổi tối và mùa đông",
      scents: [
        { id: "oriental-1", scent_id: "10", scent_name: "Quế", scent_type: "top", intensity: 3 },
        { id: "oriental-2", scent_id: "3", scent_name: "Hoa nhài", scent_type: "middle", intensity: 3 },
        { id: "oriental-3", scent_id: "5", scent_name: "Vani", scent_type: "base", intensity: 4 },
        { id: "oriental-4", scent_id: "11", scent_name: "Hổ phách", scent_type: "base", intensity: 4 },
      ],
    },
  ]

  // Lấy gợi ý hiện tại
  const currentSuggestion = suggestions.find((s) => s.id === activeTab) || suggestions[0]

  return (
    <div className="w-full">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <CardTitle className="text-base">Gợi ý hương thơm</CardTitle>
              <CardDescription>Chọn một trong các gợi ý dưới đây để thêm nhanh các hương thơm phổ biến</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              {suggestions.map((suggestion) => (
                <TabsTrigger key={suggestion.id} value={suggestion.id}>
                  {suggestion.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={currentSuggestion.id} className="mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{currentSuggestion.name}</h4>
                  <p className="text-sm text-muted-foreground">{currentSuggestion.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Hương đầu</h5>
                    <div className="space-y-1">
                      {currentSuggestion.scents
                        .filter((s) => s.scent_type === "top")
                        .map((scent) => (
                          <div key={scent.id} className="flex items-center justify-between p-2 border rounded-md">
                            <span>{scent.scent_name}</span>
                            <Badge variant="outline">{scent.intensity}/5</Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Hương giữa</h5>
                    <div className="space-y-1">
                      {currentSuggestion.scents
                        .filter((s) => s.scent_type === "middle")
                        .map((scent) => (
                          <div key={scent.id} className="flex items-center justify-between p-2 border rounded-md">
                            <span>{scent.scent_name}</span>
                            <Badge variant="outline">{scent.intensity}/5</Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Hương cuối</h5>
                    <div className="space-y-1">
                      {currentSuggestion.scents
                        .filter((s) => s.scent_type === "base")
                        .map((scent) => (
                          <div key={scent.id} className="flex items-center justify-between p-2 border rounded-md">
                            <span>{scent.scent_name}</span>
                            <Badge variant="outline">{scent.intensity}/5</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="pt-3">
          <Button className="w-full" onClick={() => onSelect(currentSuggestion.scents)}>
            Sử dụng gợi ý này
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

