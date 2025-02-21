"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { fetchUser, updateUser, fetchOrdersByUserId } from "@/lib/mockData"
import type { User, Order } from "@/lib/mockData"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUserAndOrders = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [fetchedUser, fetchedOrders] = await Promise.all([fetchUser(params.id), fetchOrdersByUserId(params.id)])
        if (fetchedUser) {
          setUser(fetchedUser)
          setOrders(fetchedOrders)
        } else {
          setError("User not found")
        }
      } catch (err) {
        setError("Failed to fetch user details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserAndOrders()
  }, [params.id])

  const handleStatusChange = async (newStatus: User["status"]) => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const updatedUser = await updateUser(user.id, { status: newStatus })
      setUser(updatedUser)
      toast({
        title: "User status updated",
        description: `User status changed to ${newStatus}.`,
      })
    } catch (err) {
      setError("Failed to update user status. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Details</h1>
        <div className="space-x-2">
          <Button onClick={() => router.push(`/admin/users/${user.id}/edit`)}>Edit User</Button>
          <Button variant="outline" onClick={() => router.push("/admin/users")}>
            Back to Users
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>
                <strong>User Code:</strong> {user.user_code}
              </p>
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge
                  variant={
                    user.status === "active" ? "success" : user.status === "inactive" ? "warning" : "destructive"
                  }
                >
                  {user.status}
                </Badge>
              </p>
            </div>
            <div>
              <p>
                <strong>Phone:</strong> {user.phone}
              </p>
              <p>
                <strong>Birthday:</strong> {user.birthday ? format(new Date(user.birthday), "PPP") : "N/A"}
              </p>
              <p>
                <strong>Gender:</strong> {user.gender || "N/A"}
              </p>
              <p>
                <strong>Registered At:</strong> {format(new Date(user.registered_at), "PPP")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent>
          {user.addresses.map((address, index) => (
            <div key={address.id} className="mb-4">
              <h3 className="font-semibold">{index === 0 ? "Default Address" : `Address ${index + 1}`}</h3>
              <p>{address.street}</p>
              <p>
                {address.city}, {address.state} {address.zipCode}
              </p>
              <p>{address.country}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.order_code}</TableCell>
                  <TableCell>{format(new Date(order.created_at), "PPP")}</TableCell>
                  <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "success"
                          : order.status === "cancelled"
                            ? "destructive"
                            : "default"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-x-2">
            <Button onClick={() => handleStatusChange(user.status === "active" ? "inactive" : "active")}>
              {user.status === "active" ? "Deactivate" : "Activate"} User
            </Button>
            <Button variant="destructive" onClick={() => handleStatusChange("blocked")}>
              Block User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

