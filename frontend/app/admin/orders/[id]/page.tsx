'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorMessage } from '@/components/ui/error-message'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import type { Order, OrderHistory, Product, User } from '@/lib/mockData'
import {
  fetchOrder,
  fetchOrderHistory,
  fetchProduct,
  fetchUser,
  updateOrderStatus
} from '@/lib/mockData'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-200 text-yellow-800',
  processing: 'bg-blue-200 text-blue-800',
  shipped: 'bg-green-200 text-green-800',
  delivered: 'bg-green-500 text-white',
  cancelled: 'bg-red-200 text-red-800'
}

export default function OrderDetailsPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrderDetails = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log('Fetching order with ID:', params.id)
        const fetchedOrder = await fetchOrder(params.id)

        if (!fetchedOrder) {
          console.log('Order not found')
          setError('Order not found')
          setIsLoading(false)
          return
        }

        console.log('Found order:', fetchedOrder)
        setOrder(fetchedOrder)

        // Fetch additional data only if we have a valid order
        try {
          const [fetchedProducts, fetchedUser, fetchedOrderHistory] =
            await Promise.all([
              Promise.all(
                fetchedOrder.products.map((item) =>
                  fetchProduct(item.product.id)
                )
              ),
              fetchUser(fetchedOrder.userId),
              fetchOrderHistory(fetchedOrder.id)
            ])

          if (!fetchedUser) {
            setError('User not found')
            setIsLoading(false)
            return
          }

          setProducts(
            fetchedProducts.filter((p): p is Product => p !== undefined)
          )
          setUser(fetchedUser)
          setOrderHistory(fetchedOrderHistory)
        } catch (err) {
          console.error('Error fetching related data:', err)
          setError('Failed to fetch order details')
        }
      } catch (err) {
        console.error('Error loading order:', err)
        setError('Failed to fetch order details. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadOrderDetails()
  }, [params.id])

  const handleStatusChange = async (newStatus: Order['status']) => {
    if (!order) return
    setIsLoading(true)
    setError(null)
    try {
      const updatedOrder = await updateOrderStatus(order.id, newStatus)
      setOrder(updatedOrder)
      const fetchedOrderHistory = await fetchOrderHistory(order.id)
      setOrderHistory(fetchedOrderHistory)
      toast({
        title: 'Order status updated',
        description: `Order status changed to ${newStatus}.`
      })
    } catch (err) {
      setError('Failed to update order status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) {
    return (
      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold'>Order Details</h1>
          <Button
            variant='outline'
            onClick={() => router.push('/admin/orders')}
          >
            Back to Orders
          </Button>
        </div>
        <ErrorMessage message={error} />
      </div>
    )
  }
  if (!order || !user) {
    return (
      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <h1 className='text-2xl font-bold'>Order Details</h1>
          <Button
            variant='outline'
            onClick={() => router.push('/admin/orders')}
          >
            Back to Orders
          </Button>
        </div>
        <ErrorMessage message='Order or user information not found' />
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Order Details</h1>
        <Button variant='outline' onClick={() => router.push('/admin/orders')}>
          Back to Orders
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <div> {/* Thay <p> bằng <div> */}
                <strong>Order Code:</strong> {order.order_code}
              </div> {/* Thay </p> bằng </div> */}
              <div> {/* Thay <p> bằng <div> */}
                <strong>Status:</strong>{' '}
                <Badge className={statusColors[order.status]}>
                  {order.status}
                </Badge>
              </div> {/* Thay </p> bằng </div> */}
              <div> {/* Thay <p> bằng <div> */}
                <strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}
              </div> {/* Thay </p> bằng </div> */}
            </div>
            <div>
              <div> {/* Thay <p> bằng <div> */}
                <strong>Created At:</strong>{' '}
                {format(new Date(order.created_at), 'PPpp')}
              </div> {/* Thay </p> bằng </div> */}
              <div> {/* Thay <p> bằng <div> */}
                <strong>Updated At:</strong>{' '}
                {format(new Date(order.updated_at), 'PPpp')}
              </div> {/* Thay </p> bằng </div> */}
              <div className='mt-2'>
                <Select value={order.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Update Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='processing'>Processing</SelectItem>
                    <SelectItem value='shipped'>Shipped</SelectItem>
                    <SelectItem value='delivered'>Delivered</SelectItem>
                    <SelectItem value='cancelled'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div> {/* Thay <p> bằng <div> */}
            <strong>Name:</strong> {user.name}
          </div> {/* Thay </p> bằng </div> */}
          <div> {/* Thay <p> bằng <div> */}
            <strong>Email:</strong> {user.email}
          </div> {/* Thay </p> bằng </div> */}
          <div> {/* Thay <p> bằng <div> */}
            <strong>Phone:</strong> {user.phone}
          </div> {/* Thay </p> bằng </div> */}
          {user.defaultAddressId && (
            <div>
              <div> {/* Thay <p> bằng <div> */}
                <strong>Address:</strong>
              </div> {/* Thay </p> bằng </div> */}
              <div> {/* Thay <p> bằng <div> */}
                {
                  user.addresses.find(
                    (addr) => addr.id === user.defaultAddressId
                  )?.street
                }
              </div> {/* Thay </p> bằng </div> */}
              <div> {/* Thay <p> bằng <div> */}
                {
                  user.addresses.find(
                    (addr) => addr.id === user.defaultAddressId
                  )?.city
                }
                ,{' '}
                {
                  user.addresses.find(
                    (addr) => addr.id === user.defaultAddressId
                  )?.state
                }{' '}
                {
                  user.addresses.find(
                    (addr) => addr.id === user.defaultAddressId
                  )?.zipCode
                }
              </div> {/* Thay </p> bằng </div> */}
              <div> {/* Thay <p> bằng <div> */}
                {
                  user.addresses.find(
                    (addr) => addr.id === user.defaultAddressId
                  )?.country
                }
              </div> {/* Thay </p> bằng </div> */}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.products.map((item) => {
                const product = products.find((p) => p.id === item.product.id)
                return (
                  <TableRow key={item.product.id}>
                    <TableCell>
                      <img
                        src={product?.images[0] || '/placeholder.svg'}
                        alt={product?.name}
                        className='w-16 h-16 object-cover'
                      />
                    </TableCell>
                    <TableCell>{product?.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${product?.price.toFixed(2)}</TableCell>
                    <TableCell>
                      $
                      {(product ? product.price * item.quantity : 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {orderHistory.map((history, index) => (
              <div key={history.id} className='flex items-start space-x-4'>
                <div className='w-1 h-full bg-gray-200 relative'>
                  <div className='absolute w-3 h-3 bg-blue-500 rounded-full -left-1 top-1'></div>
                </div>
                <div>
                  <p className='font-semibold'>{history.status}</p>
                  <p className='text-sm text-gray-500'>
                    {format(new Date(history.updated_at), 'PPpp')} by{' '}
                    {history.updated_by}
                  </p>
                  {history.note && (
                    <p className='text-sm mt-1'>{history.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

