"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, Loader2, FileText, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { PolicyEditor } from "./policy-editor"
import { PolicyPreview } from "./policy-preview"

const policySchema = z.object({
  refund_policy_text: z.string().min(10, {
    message: "Chính sách đổi trả phải có ít nhất 10 ký tự",
  }),
  shipping_policy_text: z.string().min(10, {
    message: "Chính sách vận chuyển phải có ít nhất 10 ký tự",
  }),
  privacy_policy_text: z.string().min(10, {
    message: "Chính sách bảo mật phải có ít nhất 10 ký tự",
  }),
  terms_conditions_text: z.string().min(10, {
    message: "Điều khoản sử dụng phải có ít nhất 10 ký tự",
  }),
})

type PolicyFormValues = z.infer<typeof policySchema>

// Giả lập dữ liệu ban đầu
const defaultValues: Partial<PolicyFormValues> = {
  refund_policy_text:
    "<h2>Chính sách đổi trả</h2><p>Khách hàng có thể đổi trả sản phẩm trong vòng 7 ngày kể từ ngày nhận hàng nếu sản phẩm bị lỗi do nhà sản xuất hoặc không đúng với mô tả.</p><h3>Điều kiện đổi trả</h3><ul><li>Sản phẩm còn nguyên vẹn, không có dấu hiệu đã qua sử dụng</li><li>Còn đầy đủ tem, nhãn, bao bì</li><li>Có hóa đơn mua hàng</li></ul>",
  shipping_policy_text:
    "<h2>Chính sách vận chuyển</h2><p>MyBeauty cung cấp dịch vụ vận chuyển đến tất cả các tỉnh thành trên toàn quốc.</p><h3>Thời gian vận chuyển</h3><ul><li>Nội thành Hà Nội và TP.HCM: 1-2 ngày</li><li>Các tỉnh thành khác: 3-5 ngày</li></ul>",
  privacy_policy_text:
    "<h2>Chính sách bảo mật</h2><p>MyBeauty cam kết bảo vệ thông tin cá nhân của khách hàng và không chia sẻ thông tin với bên thứ ba nếu không có sự đồng ý.</p>",
  terms_conditions_text:
    "<h2>Điều khoản sử dụng</h2><p>Bằng việc sử dụng website của MyBeauty, bạn đồng ý với các điều khoản và điều kiện được quy định.</p>",
}

export function PolicyForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("refund")
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")
  const { toast } = useToast()

  const form = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues,
    mode: "onChange",
  })

  function onSubmit(data: PolicyFormValues) {
    setIsLoading(true)

    // Giả lập API call
    setTimeout(() => {
      console.log(data)
      setIsLoading(false)
      toast({
        title: "Cập nhật thành công",
        description: "Chính sách đã được cập nhật",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue="refund" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="refund">Đổi trả</TabsTrigger>
              <TabsTrigger value="shipping">Vận chuyển</TabsTrigger>
              <TabsTrigger value="privacy">Bảo mật</TabsTrigger>
              <TabsTrigger value="terms">Điều khoản</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-1 rounded-md border p-1">
                <Button
                  variant={viewMode === "edit" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("edit")}
                  className="text-xs"
                >
                  <FileText className="mr-1 h-4 w-4" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant={viewMode === "preview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("preview")}
                  className="text-xs"
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Xem trước
                </Button>
              </div>

              <Button type="submit" disabled={isLoading} onClick={form.handleSubmit(onSubmit)}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="refund" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Chính sách đổi trả</CardTitle>
                    <CardDescription>Cập nhật chính sách đổi trả sản phẩm</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="refund_policy_text"
                      render={({ field }) => (
                        <FormItem>
                          {viewMode === "edit" ? (
                            <>
                              <FormControl>
                                <PolicyEditor value={field.value} onChange={field.onChange} />
                              </FormControl>
                              <FormDescription>
                                Sử dụng trình soạn thảo để định dạng chính sách đổi trả của bạn
                              </FormDescription>
                              <FormMessage />
                            </>
                          ) : (
                            <PolicyPreview content={field.value} />
                          )}
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shipping" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Chính sách vận chuyển</CardTitle>
                    <CardDescription>Cập nhật chính sách vận chuyển</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="shipping_policy_text"
                      render={({ field }) => (
                        <FormItem>
                          {viewMode === "edit" ? (
                            <>
                              <FormControl>
                                <PolicyEditor value={field.value} onChange={field.onChange} />
                              </FormControl>
                              <FormDescription>
                                Sử dụng trình soạn thảo để định dạng chính sách vận chuyển của bạn
                              </FormDescription>
                              <FormMessage />
                            </>
                          ) : (
                            <PolicyPreview content={field.value} />
                          )}
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Chính sách bảo mật</CardTitle>
                    <CardDescription>Cập nhật chính sách bảo mật</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="privacy_policy_text"
                      render={({ field }) => (
                        <FormItem>
                          {viewMode === "edit" ? (
                            <>
                              <FormControl>
                                <PolicyEditor value={field.value} onChange={field.onChange} />
                              </FormControl>
                              <FormDescription>
                                Sử dụng trình soạn thảo để định dạng chính sách bảo mật của bạn
                              </FormDescription>
                              <FormMessage />
                            </>
                          ) : (
                            <PolicyPreview content={field.value} />
                          )}
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="terms" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Điều khoản sử dụng</CardTitle>
                    <CardDescription>Cập nhật điều khoản sử dụng</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="terms_conditions_text"
                      render={({ field }) => (
                        <FormItem>
                          {viewMode === "edit" ? (
                            <>
                              <FormControl>
                                <PolicyEditor value={field.value} onChange={field.onChange} />
                              </FormControl>
                              <FormDescription>
                                Sử dụng trình soạn thảo để định dạng điều khoản sử dụng của bạn
                              </FormDescription>
                              <FormMessage />
                            </>
                          ) : (
                            <PolicyPreview content={field.value} />
                          )}
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  )
}

