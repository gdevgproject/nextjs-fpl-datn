'use client'

import { Badge } from '@/components/ui/badge'
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
import type {
  Brand,
  Category,
  FavoriteProduct,
  Order,
  Product,
  Review,
  User
} from '@/lib/mockData'
import {
  fetchBrands,
  fetchCategories,
  fetchFavorites,
  fetchOrders,
  fetchProducts,
  fetchReviews,
  fetchUsers
} from '@/lib/mockData'
import { AlertTriangleIcon, ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

// Helper function to calculate percentage change
const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return 100
  return ((current - previous) / previous) * 100
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          fetchedOrders,
          fetchedProducts,
          fetchedUsers,
          fetchedCategories,
          fetchedBrands,
          fetchedReviews,
          fetchedFavorites
        ] = await Promise.all([
          fetchOrders(),
          fetchProducts(),
          fetchUsers(),
          fetchCategories(),
          fetchBrands(),
          fetchReviews(),
          fetchFavorites()
        ])
        setOrders(fetchedOrders)
        setProducts(fetchedProducts)
        setUsers(fetchedUsers)
        setCategories(fetchedCategories)
        setBrands(fetchedBrands)
        setReviews(fetchedReviews)
        setFavorites(fetchedFavorites)
      } catch (err) {
        setError('Failed to fetch data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  // Calculate KPIs
  const deliveredOrders = orders.filter((order) => order.status === 'delivered')
  const totalRevenue = deliveredOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  )
  const totalProfit = deliveredOrders.reduce((sum, order) => {
    return (
      sum +
      order.products.reduce((orderSum, product) => {
        const productDetails = products.find((p) => p.id === product.product.id)
        return (
          orderSum +
          product.quantity *
            ((productDetails?.price ?? 0) - (productDetails?.import_price ?? 0))
        )
      }, 0)
    )
  }, 0)
  const totalOrders = orders.length
  const newCustomers = users.filter(
    (user) => user.role === 'user' && user.status === 'active'
  ).length
  const totalViews = products.reduce((sum, product) => sum + product.view, 0)
  const conversionRate = (deliveredOrders.length / totalViews) * 100
  const averageOrderValue = totalRevenue / deliveredOrders.length
  const totalProductsSold = deliveredOrders.reduce(
    (sum, order) =>
      sum +
      order.products.reduce(
        (orderSum, product) => orderSum + product.quantity,
        0
      ),
    0
  )
  const totalCustomers = users.filter((user) => user.role === 'user').length
  const totalReviews = reviews.length
  const averageRating =
    reviews.reduce((sum, review) => sum + review.star, 0) / totalReviews

  // Calculate percentage changes (using a simple day-over-day change for this example)
  const previousDayRevenue = totalRevenue * 0.9 // Simulating previous day's revenue
  const revenueChange = calculatePercentageChange(
    totalRevenue,
    previousDayRevenue
  )

  // Prepare data for charts
  const revenueOverTime = orders.map((order) => ({
    date: new Date(order.created_at).toLocaleDateString(),
    revenue: order.totalAmount
  }))

  const topSellingProducts = products
    .sort((a, b) => b.view - a.view)
    .slice(0, 10)
    .map((product) => ({
      name: product.name,
      sales: deliveredOrders.reduce((sum, order) => {
        const orderProduct = order.products.find(
          (p) => p.product.id === product.id
        )
        return sum + (orderProduct?.quantity ?? 0)
      }, 0)
    }))

  const revenueByCategory = categories.map((category) => ({
    name: category.name,
    revenue: deliveredOrders.reduce((sum, order) => {
      return (
        sum +
        order.products.reduce((orderSum, product) => {
          const productDetails = products.find(
            (p) => p.id === product.product.id && p.category === category.id
          )
          return (
            orderSum +
            (productDetails ? product.quantity * productDetails.price : 0)
          )
        }, 0)
      )
    }, 0)
  }))

  const revenueByBrand = brands.map((brand) => ({
    name: brand.name,
    revenue: deliveredOrders.reduce((sum, order) => {
      return (
        sum +
        order.products.reduce((orderSum, product) => {
          const productDetails = products.find(
            (p) =>
              p.id === product.product.id && p.fragrance_brand_id === brand.id
          )
          return (
            orderSum +
            (productDetails ? product.quantity * productDetails.price : 0)
          )
        }, 0)
      )
    }, 0)
  }))

  const lowStockThreshold = 10
  const lowStockProducts = products.filter(
    (product) => product.stock <= lowStockThreshold
  )
  const pendingOrders = orders.filter((order) => order.status === 'pending')

  const topCustomers = users
    .filter((user) => user.role === 'user')
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5)

  const mostFavoriteProducts = products
    .map((product) => ({
      ...product,
      favoriteCount: favorites.filter((fav) => fav.product_id === product.id)
        .length
    }))
    .sort((a, b) => b.favoriteCount - a.favoriteCount)
    .slice(0, 5)

  return (
    <div className='space-y-6'>
      <h2 className='text-3xl font-bold'>Dashboard</h2>

      <div className='flex justify-end'>
        <Select
          value={timeRange}
          onValueChange={(value: 'day' | 'week' | 'month') =>
            setTimeRange(value)
          }
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select time range' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='day'>Last 24 hours</SelectItem>
            <SelectItem value='week'>Last 7 days</SelectItem>
            <SelectItem value='month'>Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(totalRevenue)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {revenueChange >= 0 ? (
                <span className='text-green-600 flex items-center'>
                  <ArrowUpIcon className='mr-1 h-4 w-4' />
                  {revenueChange.toFixed(2)}%
                </span>
              ) : (
                <span className='text-red-600 flex items-center'>
                  <ArrowDownIcon className='mr-1 h-4 w-4' />
                  {Math.abs(revenueChange).toFixed(2)}%
                </span>
              )}
              <span className='ml-1'>from previous {timeRange}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(totalProfit)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalOrders}</div>
            <div className='flex flex-wrap gap-1 mt-2'>
              <Badge>
                {orders.filter((order) => order.status === 'pending').length}{' '}
                Pending
              </Badge>
              <Badge>
                {orders.filter((order) => order.status === 'processing').length}{' '}
                Processing
              </Badge>
              <Badge>
                {orders.filter((order) => order.status === 'shipped').length}{' '}
                Shipped
              </Badge>
              <Badge>
                {orders.filter((order) => order.status === 'delivered').length}{' '}
                Delivered
              </Badge>
              <Badge variant='destructive'>
                {orders.filter((order) => order.status === 'cancelled').length}{' '}
                Cancelled
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>New Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{newCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {conversionRate.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Average Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(averageOrderValue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Products Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalProductsSold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalCustomers}</div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='revenue'
                  stroke='#8884d8'
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={topSellingProducts}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='sales' fill='#8884d8' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  dataKey='revenue'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  outerRadius={80}
                  fill='#8884d8'
                  label
                >
                  {revenueByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${
                        (index * 360) / revenueByCategory.length
                      }, 70%, 50%)`}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Brand</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={revenueByBrand}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey='revenue' fill='#82ca9d' />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Code</TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.order_code}</TableCell>
                    <TableCell>
                      {users.find((user) => user.id === order.userId)?.name ||
                        'Unknown'}
                    </TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Total Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{formatCurrency(customer.totalSpent)}</TableCell>
                    <TableCell>{customer.totalOrders}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Most Favorited Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Favorite Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mostFavoriteProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.favoriteCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {lowStockProducts.length > 0 && (
                <div className='flex items-center space-x-2 text-yellow-600'>
                  <AlertTriangleIcon />
                  <span>{lowStockProducts.length} products with low stock</span>
                </div>
              )}
              {pendingOrders.length > 0 && (
                <div className='flex items-center space-x-2 text-blue-600'>
                  <AlertTriangleIcon />
                  <span>{pendingOrders.length} pending orders</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <h3 className='font-semibold'>Total Reviews</h3>
              <p className='text-2xl'>{totalReviews}</p>
            </div>
            <div>
              <h3 className='font-semibold'>Average Rating</h3>
              <p className='text-2xl'>{averageRating.toFixed(1)} / 5</p>
            </div>
            <div>
              <h3 className='font-semibold'>Total Products</h3>
              <p className='text-2xl'>{products.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

