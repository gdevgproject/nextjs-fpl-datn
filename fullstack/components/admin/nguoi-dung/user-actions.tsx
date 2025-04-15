"use client"

import { useState } from "react"
import { UserStatusToggle } from "@/components/admin/nguoi-dung/user-status-toggle"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mail, MessageSquare, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UserActionsProps {
  userId: string
  isActive: boolean
}

export function UserActions({ userId, isActive }: UserActionsProps) {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)

  return (
    <div className="w-full space-y-3">
      <UserStatusToggle userId={userId} isActive={isActive} />

      <div className="grid grid-cols-2 gap-2">
        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Gửi email
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gửi email cho người dùng</DialogTitle>
              <DialogDescription>Email sẽ được gửi trực tiếp đến địa chỉ email của người dùng.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Tiêu đề</Label>
                <Input id="subject" placeholder="Nhập tiêu đề email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Nội dung</Label>
                <Textarea id="message" placeholder="Nhập nội dung email..." rows={5} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Gửi email</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              <MessageSquare className="mr-2 h-4 w-4" />
              Ghi chú
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm ghi chú về người dùng</DialogTitle>
              <DialogDescription>Ghi chú này chỉ hiển thị cho admin và nhân viên.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea placeholder="Nhập ghi chú về người dùng..." rows={5} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu ghi chú</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <MoreHorizontal className="mr-2 h-4 w-4" />
            Thao tác khác
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Xem lịch sử hoạt động</DropdownMenuItem>
          <DropdownMenuItem>Xuất dữ liệu người dùng</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Xóa tài khoản</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

