"use client"

import type React from "react"

import { Button } from "@/components/ui/Button"
import { Check } from "lucide-react"
import { useState } from "react"

interface ArticleCommentProps {
  articleId: string
}

export default function ArticleComment({ articleId }: ArticleCommentProps) {
  const [comment, setComment] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment || !name || !email) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Comment submitted:", { articleId, name, email, comment })
      setComment("")
      setName("")
      setEmail("")
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {isSubmitted ? (
        <div className="rounded-lg bg-success-5/10 p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-5">
              <Check className="h-6 w-6 text-white" />
            </div>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-grayscale-90">Đã kiểm duyệt nội dung</h3>
          <p className="text-grayscale-60">
            Cảm ơn bạn đã để lại bình luận. Bình luận của bạn sẽ được hiển thị sau khi được kiểm
            duyệt.
          </p>
          <Button
            onClick={() => setIsSubmitted(false)}
            className="mt-4 bg-primary-5 text-white hover:bg-primary-20"
          >
            Thêm bình luận khác
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-grayscale-90">Để lại bình luận</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm text-grayscale-70">
                Họ tên <span className="text-error-5">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-grayscale-20 px-4 py-2 text-grayscale-90 focus:border-primary-40 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-grayscale-70">
                Email <span className="text-error-5">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-grayscale-20 px-4 py-2 text-grayscale-90 focus:border-primary-40 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="mb-1 block text-sm text-grayscale-70">
              Bình luận <span className="text-error-5">*</span>
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-grayscale-20 px-4 py-2 text-grayscale-90 focus:border-primary-40 focus:outline-none"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-5 text-white hover:bg-primary-20"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-grayscale-90">Bình luận (0)</h3>
          <div className="text-sm text-grayscale-60">
            <span>Sắp xếp theo: </span>
            <select className="border-none bg-transparent text-primary-40 focus:outline-none">
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>

        <p className="py-4 text-center text-grayscale-60">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </p>
      </div>
    </div>
  )
}
