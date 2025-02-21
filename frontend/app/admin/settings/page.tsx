"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { fetchSettings, updateSettings } from "@/lib/mockData"
import { toast } from "@/components/ui/use-toast"

const settingsSchema = z.object({
  general: z.object({
    siteName: z.string().min(1, "Site name is required"),
    siteUrl: z.string().url("Invalid URL"),
    adminEmail: z.string().email("Invalid email"),
  }),
  emailTemplates: z.object({
    welcome: z.string().min(1, "Welcome email template is required"),
    orderConfirmation: z.string().min(1, "Order confirmation email template is required"),
    passwordReset: z.string().min(1, "Password reset email template is required"),
  }),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  })

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const settings = await fetchSettings()
        reset(settings)
      } catch (err) {
        setError("Failed to fetch settings. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [reset])

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      await updateSettings(data)
      toast({
        title: "Settings updated",
        description: "Your settings have been successfully updated.",
      })
    } catch (err) {
      setError("Failed to update settings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" {...register("general.siteName")} />
                {errors.general?.siteName && <ErrorMessage message={errors.general.siteName.message || "Error"} />}
              </div>
              <div>
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input id="siteUrl" {...register("general.siteUrl")} />
                {errors.general?.siteUrl && <ErrorMessage message={errors.general.siteUrl.message || "Error"} />}
              </div>
              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input id="adminEmail" type="email" {...register("general.adminEmail")} />
                {errors.general?.adminEmail && <ErrorMessage message={errors.general.adminEmail.message || "Error"} />}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="welcomeEmail">Welcome Email</Label>
                <Controller
                  name="emailTemplates.welcome"
                  control={control}
                  render={({ field }) => <Textarea id="welcomeEmail" {...field} />}
                />
                {errors.emailTemplates?.welcome && (
                  <ErrorMessage message={errors.emailTemplates.welcome.message || "Error"} />
                )}
              </div>
              <div>
                <Label htmlFor="orderConfirmationEmail">Order Confirmation Email</Label>
                <Controller
                  name="emailTemplates.orderConfirmation"
                  control={control}
                  render={({ field }) => <Textarea id="orderConfirmationEmail" {...field} />}
                />
                {errors.emailTemplates?.orderConfirmation && (
                  <ErrorMessage message={errors.emailTemplates.orderConfirmation.message || "Error"} />
                )}
              </div>
              <div>
                <Label htmlFor="passwordResetEmail">Password Reset Email</Label>
                <Controller
                  name="emailTemplates.passwordReset"
                  control={control}
                  render={({ field }) => <Textarea id="passwordResetEmail" {...field} />}
                />
                {errors.emailTemplates?.passwordReset && (
                  <ErrorMessage message={errors.emailTemplates.passwordReset.message || "Error"} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="mt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : "Save Settings"}
        </Button>
      </div>
    </form>
  )
}

