"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="container flex max-w-md flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-bold">Đã xảy ra lỗi</h1>
            <p className="text-muted-foreground">Đã có lỗi xảy ra. Vui lòng thử lại sau.</p>
            <Button onClick={() => reset()}>Thử lại</Button>
          </div>
        </div>
      </body>
    </html>
  )
}

