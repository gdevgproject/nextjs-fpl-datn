"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { fetchUser, updateUser } from "@/lib/mockData"
import type { User } from "@/lib/mockData"
import { toast } from "@/components/ui/use-toast"

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  role: z.enum(["admin", "user"]),
  status: z.enum(["active", "inactive", "blocked"]),
  phone: z.string().optional(),
  birthday: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
})

type UserFormData = z.infer<typeof userSchema>

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const fetchedUser = await fetchUser(params.id)
        if (fetchedUser) {
          setUser(fetchedUser)
          reset({
            name: fetchedUser.name,
            email: fetchedUser.email,
            role: fetchedUser.role,
            status: fetchedUser.status,
            phone: fetchedUser.phone,
            birthday: fetchedUser.birthday,
            gender: fetchedUser.gender,
          })
        } else {
          setError("User not found")
        }
      } catch (err) {
        setError("Failed to fetch user. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [params.id, reset])

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      await updateUser(params.id, data)
      toast({
        title: "User updated",
        description: "The user has been successfully updated.",
      })
      router.push("/admin/users")
    } catch (err) {
      setError("Failed to update user. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!user) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Controller name="name" control={control} render={({ field }) => <Input {...field} />} />
            {errors.name && <ErrorMessage message={errors.name.message || "Error"} />}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Controller name="email" control={control} render={({ field }) => <Input {...field} type="email" />} />
            {errors.email && <ErrorMessage message={errors.email.message || "Error"} />}
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <ErrorMessage message={errors.role.message || "Error"} />}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <ErrorMessage message={errors.status.message || "Error"} />}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Controller name="phone" control={control} render={({ field }) => <Input {...field} />} />
          </div>

          <div>
            <Label htmlFor="birthday">Birthday</Label>
            <Controller name="birthday" control={control} render={({ field }) => <Input {...field} type="date" />} />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

