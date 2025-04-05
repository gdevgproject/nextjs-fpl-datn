"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, Loader2, Facebook, Instagram, Youtube, MessageCircle, Globe, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const socialLinksSchema = z.object({
  facebook_url: z.string().url({ message: "URL không hợp lệ" }).or(z.literal("")),
  messenger_url: z.string().url({ message: "URL không hợp lệ" }).or(z.literal("")),
  zalo_url: z.string().url({ message: "URL không hợp lệ" }).or(z.literal("")),
  instagram_url: z.string().url({ message: "URL không hợp lệ" }).or(z.literal("")),
  tiktok_url: z.string().url({ message: "URL không hợp lệ" }).or(z.literal("")),
  youtube_url: z.string().url({ message: "URL không hợp lệ" }).or(z.literal("")),
})

type SocialLinksFormValues = z.infer<typeof socialLinksSchema>

// Giả lập dữ liệu ban đầu
const defaultValues: Partial<SocialLinksFormValues> = {
  facebook_url: "https://facebook.com/mybeauty",
  messenger_url: "https://m.me/mybeauty",
  zalo_url: "https://zalo.me/mybeauty",
  instagram_url: "https://instagram.com/mybeauty",
  tiktok_url: "https://tiktok.com/@mybeauty",
  youtube_url: "https://youtube.com/c/mybeauty",
}

// Danh sách mạng xã hội có thể thêm
const availableSocialNetworks = [
  { id: "twitter", name: "Twitter", icon: <Globe className="h-4 w-4" /> },
  { id: "linkedin", name: "LinkedIn", icon: <Globe className="h-4 w-4" /> },
  { id: "pinterest", name: "Pinterest", icon: <Globe className="h-4 w-4" /> },
]

export function ShopSocialLinks() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showInFooter, setShowInFooter] = useState<boolean>(true)
  const [showInHeader, setShowInHeader] = useState<boolean>(false)
  const [additionalSocialNetworks, setAdditionalSocialNetworks] = useState<Array<{ id: string; url: string }>>([])
  const { toast } = useToast()

  const form = useForm<SocialLinksFormValues>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues,
    mode: "onChange",
  })

  function onSubmit(data: SocialLinksFormValues) {
    setIsLoading(true)

    // Giả lập API call
    setTimeout(() => {
      console.log(data)
      console.log("Additional networks:", additionalSocialNetworks)
      console.log("Show in footer:", showInFooter)
      console.log("Show in header:", showInHeader)
      setIsLoading(false)
      toast({
        title: "Cập nhật thành công",
        description: "Liên kết mạng xã hội đã được cập nhật",
      })
    }, 1000)
  }

  const handleAddSocialNetwork = () => {
    setAdditionalSocialNetworks([...additionalSocialNetworks, { id: "", url: "" }])
  }

  const handleRemoveSocialNetwork = (index: number) => {
    const newNetworks = [...additionalSocialNetworks]
    newNetworks.splice(index, 1)
    setAdditionalSocialNetworks(newNetworks)
  }

  const handleSocialNetworkChange = (index: number, field: "id" | "url", value: string) => {
    const newNetworks = [...additionalSocialNetworks]
    newNetworks[index][field] = value
    setAdditionalSocialNetworks(newNetworks)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liên kết mạng xã hội</CardTitle>
        <CardDescription>Cập nhật liên kết đến các trang mạng xã hội của cửa hàng</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="facebook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                      Facebook
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/yourpage" {...field} />
                    </FormControl>
                    <FormDescription>URL trang Facebook của cửa hàng</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="messenger_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <MessageCircle className="mr-2 h-4 w-4 text-blue-500" />
                      Messenger
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://m.me/yourpage" {...field} />
                    </FormControl>
                    <FormDescription>URL Messenger của cửa hàng</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="zalo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm bg-blue-600 text-[10px] font-bold text-white">
                        Z
                      </span>
                      Zalo
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://zalo.me/yourpage" {...field} />
                    </FormControl>
                    <FormDescription>URL Zalo của cửa hàng</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instagram_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Instagram className="mr-2 h-4 w-4 text-pink-600" />
                      Instagram
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/yourpage" {...field} />
                    </FormControl>
                    <FormDescription>URL Instagram của cửa hàng</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="tiktok_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <span className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm bg-black text-[10px] font-bold text-white">
                        TT
                      </span>
                      TikTok
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://tiktok.com/@yourpage" {...field} />
                    </FormControl>
                    <FormDescription>URL TikTok của cửa hàng</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="youtube_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Youtube className="mr-2 h-4 w-4 text-red-600" />
                      YouTube
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://youtube.com/c/yourpage" {...field} />
                    </FormControl>
                    <FormDescription>URL kênh YouTube của cửa hàng</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {additionalSocialNetworks.length > 0 && (
              <>
                <Separator className="my-4" />
                <h3 className="text-lg font-medium mb-4">Mạng xã hội bổ sung</h3>

                {additionalSocialNetworks.map((network, index) => (
                  <div key={index} className="grid gap-4 sm:grid-cols-8 items-end mb-4">
                    <div className="sm:col-span-3">
                      <FormLabel>Mạng xã hội</FormLabel>
                      <Select
                        value={network.id}
                        onValueChange={(value) => handleSocialNetworkChange(index, "id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn mạng xã hội" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSocialNetworks.map((social) => (
                            <SelectItem key={social.id} value={social.id}>
                              <div className="flex items-center">
                                {social.icon}
                                <span className="ml-2">{social.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-4">
                      <FormLabel>URL</FormLabel>
                      <Input
                        placeholder="https://"
                        value={network.url}
                        onChange={(e) => handleSocialNetworkChange(index, "url", e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSocialNetwork(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}

            <Button type="button" variant="outline" size="sm" onClick={handleAddSocialNetwork} className="mt-2">
              <Plus className="mr-2 h-4 w-4" />
              Thêm mạng xã hội khác
            </Button>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tùy chọn hiển thị</h3>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Hiển thị ở footer</FormLabel>
                  <FormDescription>Hiển thị các biểu tượng mạng xã hội ở footer của website</FormDescription>
                </div>
                <Switch checked={showInFooter} onCheckedChange={setShowInFooter} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Hiển thị ở header</FormLabel>
                  <FormDescription>Hiển thị các biểu tượng mạng xã hội ở header của website</FormDescription>
                </div>
                <Switch checked={showInHeader} onCheckedChange={setShowInHeader} />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
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
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

