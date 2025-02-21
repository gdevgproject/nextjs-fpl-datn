'use client'

import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Input } from '@/components/ui/input'
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
import { deleteDiscount, type Discount, fetchDiscounts } from '@/lib/mockData'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [permanentFilter, setPermanentFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    fetchDiscounts().then(setDiscounts)
  }, [])

  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch = discount.discount_code
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesPermanent =
      permanentFilter === 'all' ||
      (permanentFilter === 'yes' && discount.permanent) ||
      (permanentFilter === 'no' && !discount.permanent)
    return matchesSearch && matchesPermanent
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteDiscount(id)
      setDiscounts(discounts.filter((discount) => discount.id !== id))
      toast.success('Discount deleted successfully')
    } catch (error) {
      toast.error('Failed to delete discount')
    }
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Discounts</h1>
        <Button asChild>
          <Link href='/admin/discounts/new'>Add Discount</Link>
        </Button>
      </div>
      <div className='flex gap-4 mb-6'>
        <Input
          placeholder='Search discounts...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='max-w-sm'
        />
        <Select
          value={permanentFilter}
          onValueChange={(value) => setPermanentFilter(value)}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filter by type' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All</SelectItem>
            <SelectItem value='yes'>Permanent</SelectItem>
            <SelectItem value='no'>Time-limited</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Discount Code</TableHead>
            <TableHead>Permanent</TableHead>
            <TableHead>Percent</TableHead>
            <TableHead>Minimum Spend</TableHead>
            <TableHead>Maximum Spend</TableHead>
            <TableHead>Limit</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDiscounts.map((discount) => (
            <TableRow key={discount.id}>
              <TableCell>{discount.discount_code}</TableCell>
              <TableCell>{discount.permanent ? 'Yes' : 'No'}</TableCell>
              <TableCell>{discount.percent}%</TableCell>
              <TableCell>
                {discount.minimum_spend
                  ? `$${discount.minimum_spend.toFixed(2)}`
                  : 'N/A'}
              </TableCell>
              <TableCell>
                {discount.maximum_spend
                  ? `$${discount.maximum_spend.toFixed(2)}`
                  : 'N/A'}
              </TableCell>
              <TableCell>{discount.limit || 'Unlimited'}</TableCell>
              <TableCell>{formatDate(discount.created_at)}</TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      router.push(`/admin/discounts/${discount.id}/edit`)
                    }
                  >
                    Edit
                  </Button>
                  <ConfirmationDialog
                    title='Delete Discount'
                    message='Are you sure you want to delete this discount?'
                    onConfirm={() => handleDelete(discount.id)}
                  >
                    <Button variant='destructive' size='sm'>
                      Delete
                    </Button>
                  </ConfirmationDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

