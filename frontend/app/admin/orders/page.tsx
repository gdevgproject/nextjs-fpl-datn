'use client'

import type React from 'react'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range'
import { ErrorMessage } from '@/components/ui/error-message'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { fetchOrders, updateOrderStatus, fetchUsers } from '@/lib/mockData'
import type { Order, User } from '@/lib/mockData'
import { toast } from '@/components/ui/use-toast'
import { Eye, FileDown } from 'lucide-react'
import debounce from 'lodash/debounce'
import { format } from 'date-fns'

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-200 text-yellow-800',
  processing: 'bg-blue-200 text-blue-800',
  shipped: 'bg-green-200 text-green-800',
  delivered: 'bg-green-500 text-white',
  cancelled: 'bg-red-200 text-red-800'
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: [] as Order['status'][],
    dateRange: { from: undefined, to: undefined } as {
      from: Date | undefined
      to: Date | undefined
    },
    minAmount: '',
    maxAmount: ''
  })
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Order
    direction: 'asc' | 'desc'
  }>({
    key: 'created_at',
    direction: 'desc'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [fetchedOrders, fetchedUsers] = await Promise.all([
          fetchOrders(),
          fetchUsers()
        ])
        setOrders(fetchedOrders)
        setUsers(fetchedUsers)
      } catch (err) {
        setError('Failed to fetch orders. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setSearchTerm(term)
        setCurrentPage(1)
      }, 300),
    []
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      status: [],
      dateRange: { from: undefined, to: undefined },
      minAmount: '',
      maxAmount: ''
    })
    setCurrentPage(1)
  }

  const handleSort = (key: keyof Order) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order['status']
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus)
      setOrders(
        orders.map((order) => (order.id === orderId ? updatedOrder : order))
      )
      toast({
        title: 'Order status updated',
        description: `Order ${orderId} status changed to ${newStatus}.`
      })
    } catch (err) {
      setError('Failed to update order status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const user = users.find((u) => u.id === order.userId)
        const matchesSearch =
          order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus =
          filters.status.length === 0 || filters.status.includes(order.status)
        const matchesDateRange =
          (!filters.dateRange.from ||
            new Date(order.created_at) >= filters.dateRange.from) &&
          (!filters.dateRange.to ||
            new Date(order.created_at) <= filters.dateRange.to)
        const matchesAmount =
          (!filters.minAmount ||
            order.totalAmount >= Number(filters.minAmount)) &&
          (!filters.maxAmount || order.totalAmount <= Number(filters.maxAmount))

        return (
          matchesSearch && matchesStatus && matchesDateRange && matchesAmount
        )
      })
      .sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === 'asc' ? -1 : 1
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
  }, [orders, users, searchTerm, filters, sortConfig])

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedOrders.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedOrders, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  const handleExport = () => {
    // Implement CSV export logic here
    toast({
      title: 'Export',
      description: 'CSV export functionality to be implemented.'
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Orders</h1>
        <Button variant='outline' onClick={handleExport}>
          <FileDown className='mr-2 h-4 w-4' /> Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <div>
              <Input
                placeholder='Search by order code, customer name, email...'
                onChange={handleSearchChange}
                className='w-full'
              />
            </div>
            <div>
              <Select
                onValueChange={(value) =>
                  handleFilterChange(
                    'status',
                    value === 'all'
                      ? []
                      : (value.split(',') as Order['status'][])
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Filter by status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='pending,processing,shipped,delivered,cancelled'>
                    Multiple Statuses
                  </SelectItem>
                  <SelectItem value='pending'>Pending</SelectItem>
                  <SelectItem value='processing'>Processing</SelectItem>
                  <SelectItem value='shipped'>Shipped</SelectItem>
                  <SelectItem value='delivered'>Delivered</SelectItem>
                  <SelectItem value='cancelled'>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <DatePickerWithRange
                onChange={(range) =>
                  handleFilterChange('dateRange', {
                    from: range?.from,
                    to: range?.to
                  })
                }
              />
            </div>
            <div>
              <Input
                type='number'
                placeholder='Min Amount'
                value={filters.minAmount}
                onChange={(e) =>
                  handleFilterChange('minAmount', e.target.value)
                }
              />
            </div>
            <div>
              <Input
                type='number'
                placeholder='Max Amount'
                value={filters.maxAmount}
                onChange={(e) =>
                  handleFilterChange('maxAmount', e.target.value)
                }
              />
            </div>
          </div>
          <Button className='mt-4' onClick={clearFilters}>
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('order_code')}
                >
                  Order Code{' '}
                  {sortConfig.key === 'order_code' &&
                    (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('totalAmount')}
                >
                  Total Amount{' '}
                  {sortConfig.key === 'totalAmount' &&
                    (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('status')}
                >
                  Status{' '}
                  {sortConfig.key === 'status' &&
                    (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('created_at')}
                >
                  Created At{' '}
                  {sortConfig.key === 'created_at' &&
                    (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead
                  className='cursor-pointer'
                  onClick={() => handleSort('updated_at')}
                >
                  Updated At{' '}
                  {sortConfig.key === 'updated_at' &&
                    (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => {
                const user = users.find((u) => u.id === order.userId)
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className='text-blue-600 hover:underline'
                      >
                        {order.order_code}
                      </Link>
                    </TableCell>
                    <TableCell>{user ? user.name : 'Guest'}</TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.created_at), 'PPpp')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.updated_at), 'PPpp')}
                    </TableCell>
                    <TableCell>
                      <div className='flex space-x-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            router.push(`/admin/orders/${order.id}`)
                          }
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            handleStatusChange(
                              order.id,
                              value as Order['status']
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Update Status' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='pending'>Pending</SelectItem>
                            <SelectItem value='processing'>
                              Processing
                            </SelectItem>
                            <SelectItem value='shipped'>Shipped</SelectItem>
                            <SelectItem value='delivered'>Delivered</SelectItem>
                            <SelectItem value='cancelled'>Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className='flex justify-between items-center'>
        <div className='flex items-center space-x-2'>
          <span>Show</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className='w-[70px]'>
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>items per page</span>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <Button
            variant='outline'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

