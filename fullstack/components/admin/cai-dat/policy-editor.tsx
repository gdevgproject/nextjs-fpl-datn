"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PolicyEditorProps {
  value: string
  onChange: (value: string) => void
}

export function PolicyEditor({ value, onChange }: PolicyEditorProps) {
  const [htmlValue, setHtmlValue] = useState(value)
  const [activeTab, setActiveTab] = useState<string>("visual")
  const [previewHtml, setPreviewHtml] = useState("")

  useEffect(() => {
    setHtmlValue(value)
  }, [value])

  useEffect(() => {
    // Update preview when HTML changes
    setPreviewHtml(htmlValue)
  }, [htmlValue])

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlValue(e.target.value)
    onChange(e.target.value)
  }

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = document.getElementById("html-editor") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = htmlValue.substring(start, end)
    const newText = htmlValue.substring(0, start) + openTag + selectedText + closeTag + htmlValue.substring(end)

    setHtmlValue(newText)
    onChange(newText)

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + openTag.length, end + openTag.length)
    }, 0)
  }

  const insertHeading = (level: number) => {
    insertTag(`<h${level}>`, `</h${level}>`)
  }

  const insertList = (ordered: boolean) => {
    const listType = ordered ? "ol" : "ul"
    insertTag(`<${listType}>\n  <li>`, `</li>\n</${listType}>`)
  }

  const insertLink = () => {
    const url = prompt("Nhập URL:", "https://")
    if (url) {
      const textarea = document.getElementById("html-editor") as HTMLTextAreaElement
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = htmlValue.substring(start, end)
      const linkText = selectedText || "Liên kết"
      const linkHtml = `<a href="${url}">${linkText}</a>`

      const newText = htmlValue.substring(0, start) + linkHtml + htmlValue.substring(end)
      setHtmlValue(newText)
      onChange(newText)
    }
  }

  const insertImage = () => {
    const url = prompt("Nhập URL hình ảnh:", "https://")
    if (url) {
      const alt = prompt("Nhập mô tả hình ảnh:", "")
      const imgHtml = `<img src="${url}" alt="${alt || ""}" />`

      const textarea = document.getElementById("html-editor") as HTMLTextAreaElement
      if (!textarea) return

      const start = textarea.selectionStart
      const newText = htmlValue.substring(0, start) + imgHtml + htmlValue.substring(start)
      setHtmlValue(newText)
      onChange(newText)
    }
  }

  const alignText = (alignment: string) => {
    insertTag(`<div style="text-align: ${alignment}">`, `</div>`)
  }

  return (
    <div className="border rounded-md">
      <Tabs defaultValue="visual" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <TabsList>
            <TabsTrigger value="visual">Trình soạn thảo</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="preview">Xem trước</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="visual" className="p-0">
          <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => insertTag("<b>", "</b>")}>
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>In đậm</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => insertTag("<i>", "</i>")}>
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>In nghiêng</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => insertTag("<u>", "</u>")}>
                    <Underline className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Gạch chân</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => insertHeading(1)}>
                    <Heading1 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tiêu đề 1</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => insertHeading(2)}>
                    <Heading2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tiêu đề 2</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => insertHeading(3)}>
                    <Heading3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tiêu đề 3</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => insertList(false)}>
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Danh sách không thứ tự</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => insertList(true)}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Danh sách có thứ tự</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => alignText("left")}>
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Căn trái</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => alignText("center")}>
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Căn giữa</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => alignText("right")}>
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Căn phải</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-6" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={insertLink}>
                    <Link className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chèn liên kết</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={insertImage}>
                    <Image className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chèn hình ảnh</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Textarea
            id="html-editor"
            value={htmlValue}
            onChange={handleHtmlChange}
            className="min-h-[300px] rounded-none border-0 resize-y font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="html" className="p-0">
          <Textarea
            id="html-editor-raw"
            value={htmlValue}
            onChange={handleHtmlChange}
            className="min-h-[350px] rounded-none border-0 resize-y font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="preview" className="p-4 min-h-[350px] prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

