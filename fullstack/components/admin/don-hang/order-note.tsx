"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface OrderNoteProps {
  orderId: string
}

export default function OrderNote({ orderId }: OrderNoteProps) {
  const [note, setNote] = useState("")

  // Mẫu dữ liệu ghi chú
  const notes = [
    {
      id: "NOTE-001",
      content: "Khách hàng yêu cầu giao hàng vào buổi sáng",
      createdAt: new Date("2023-06-01T16:30:00"),
      createdBy: {
        id: "USR-001",
        name: "Admin",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    },
    {
      id: "NOTE-002",
      content: "Đã liên hệ với khách hàng để xác nhận đơn hàng",
      createdAt: new Date("2023-06-02T09:15:00"),
      createdBy: {
        id: "USR-002",
        name: "Nhân viên",
        avatar: "/placeholder.svg?height=32&width=32",
      },
    },
  ]

  const handleAddNote = () => {
    // Xử lý thêm ghi chú ở đây
    console.log({
      orderId,
      note,
    })
    setNote("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ghi chú đơn hàng</CardTitle>
        <CardDescription>Ghi chú nội bộ cho đơn hàng #{orderId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((item) => (
              <div key={item.id} className="flex space-x-4">
                <Avatar>
                  <AvatarImage src={item.createdBy.avatar} alt={item.createdBy.name} />
                  <AvatarFallback>{item.createdBy.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.createdBy.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(item.createdAt, "dd/MM/yyyy HH:mm", { locale: vi })}
                    </p>
                  </div>
                  <p className="text-sm">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">Chưa có ghi chú nào cho đơn hàng này.</div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Textarea
          placeholder="Thêm ghi chú mới..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full"
        />
        <Button onClick={handleAddNote} className="self-end">
          Thêm ghi chú
        </Button>
      </CardFooter>
    </Card>
  )
}

