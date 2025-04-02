"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Pencil, Trash2, MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Mẫu dữ liệu phản hồi đánh giá
const repliesData = [
  {
    id: "reply1",
    admin: {
      id: "admin1",
      name: "Admin",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Cảm ơn bạn đã đánh giá sản phẩm của chúng tôi. Chúng tôi rất vui khi bạn hài lòng với sản phẩm. Mong rằng bạn sẽ tiếp tục ủng hộ shop trong tương lai.",
    created_at: "2023-10-16T10:15:00Z",
    updated_at: null,
    is_edited: false,
  },
]

interface ReviewRepliesProps {
  reviewId: string
}

export function ReviewReplies({ reviewId }: ReviewRepliesProps) {
  const { toast } = useToast()
  const [replies, setReplies] = useState(repliesData)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [replyToDelete, setReplyToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Giả lập lấy dữ liệu phản hồi
  // Trong thực tế, bạn sẽ fetch dữ liệu từ API

  const handleEdit = (replyId: string) => {
    // Trong thực tế, bạn sẽ chuyển đến form chỉnh sửa
    console.log("Edit reply:", replyId)
  }

  const handleDeleteClick = (replyId: string) => {
    setReplyToDelete(replyId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!replyToDelete) return

    setIsDeleting(true)

    try {
      // Giả lập xử lý backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Cập nhật UI
      setReplies(replies.filter((reply) => reply.id !== replyToDelete))

      toast({
        title: "Đã xóa phản hồi",
        description: "Phản hồi đã được xóa thành công.",
      })
    } catch (error) {
      console.error("Error deleting reply:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xóa phản hồi. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setReplyToDelete(null)
    }
  }

  if (replies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Phản hồi</CardTitle>
          <CardDescription>Chưa có phản hồi nào cho đánh giá này</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">Chưa có phản hồi nào</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Phản hồi</CardTitle>
          <CardDescription>Phản hồi của shop cho đánh giá này</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {replies.map((reply) => (
            <div key={reply.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={reply.admin.avatar} alt={reply.admin.name} />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{reply.admin.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <time>{format(new Date(reply.created_at), "HH:mm 'ngày' dd/MM/yyyy", { locale: vi })}</time>
                      {reply.is_edited && <span>(đã chỉnh sửa)</span>}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Thao tác</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(reply.id)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Chỉnh sửa</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(reply.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Xóa</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="rounded-md border p-3 text-sm">{reply.content}</div>

              <Separator />
            </div>
          ))}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phản hồi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phản hồi này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteConfirm()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa phản hồi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

