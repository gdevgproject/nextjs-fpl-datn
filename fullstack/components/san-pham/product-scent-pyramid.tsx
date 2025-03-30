"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ScentNote {
  name: string
  description: string
}

interface ProductScentPyramidProps {
  scents: {
    top: ScentNote[]
    middle: ScentNote[]
    base: ScentNote[]
  }
}

export function ProductScentPyramid({ scents }: ProductScentPyramidProps) {
  const [activeTab, setActiveTab] = useState("visual")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Tháp hương</h2>
        <p className="text-muted-foreground mb-6">
          Tháp hương là cấu trúc của một mùi hương, thể hiện sự chuyển đổi từ hương đầu (top notes) sang hương giữa
          (middle notes) và cuối cùng là hương cuối (base notes).
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="visual">Hình ảnh</TabsTrigger>
          <TabsTrigger value="details">Chi tiết</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="pt-2">
          <div className="relative max-w-md mx-auto">
            <div className="pyramid-container">
              {/* Top notes */}
              <div className="pyramid-section pyramid-top">
                <div className="pyramid-content">
                  <h3 className="font-medium mb-2">Hương đầu</h3>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {scents.top.map((note, index) => (
                      <Badge key={index} variant="outline" className="bg-background">
                        {note.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Middle notes */}
              <div className="pyramid-section pyramid-middle">
                <div className="pyramid-content">
                  <h3 className="font-medium mb-2">Hương giữa</h3>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {scents.middle.map((note, index) => (
                      <Badge key={index} variant="outline" className="bg-background">
                        {note.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Base notes */}
              <div className="pyramid-section pyramid-base">
                <div className="pyramid-content">
                  <h3 className="font-medium mb-2">Hương cuối</h3>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {scents.base.map((note, index) => (
                      <Badge key={index} variant="outline" className="bg-background">
                        {note.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <style jsx>{`
            .pyramid-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 1rem;
            }
            
            .pyramid-section {
              width: 100%;
              padding: 1.5rem;
              border-radius: 0.5rem;
              text-align: center;
            }
            
            .pyramid-top {
              background-color: hsl(var(--primary) / 0.1);
              max-width: 70%;
            }
            
            .pyramid-middle {
              background-color: hsl(var(--primary) / 0.15);
              max-width: 85%;
            }
            
            .pyramid-base {
              background-color: hsl(var(--primary) / 0.2);
              max-width: 100%;
            }
          `}</style>
        </TabsContent>

        <TabsContent value="details" className="pt-2">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-center mb-4">Hương đầu (Top Notes)</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Hương đầu là ấn tượng đầu tiên, thường tồn tại trong 15 phút đầu tiên.
                </p>
                <ul className="space-y-3">
                  {scents.top.map((note, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium">{note.name}:</span> {note.description}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-center mb-4">Hương giữa (Middle Notes)</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Hương giữa xuất hiện sau khi hương đầu tan biến, kéo dài từ 2-4 giờ.
                </p>
                <ul className="space-y-3">
                  {scents.middle.map((note, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium">{note.name}:</span> {note.description}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-center mb-4">Hương cuối (Base Notes)</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Hương cuối là nền tảng của mùi hương, có thể kéo dài đến 24 giờ.
                </p>
                <ul className="space-y-3">
                  {scents.base.map((note, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium">{note.name}:</span> {note.description}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

