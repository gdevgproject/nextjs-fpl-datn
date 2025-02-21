'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorMessage } from '@/components/ui/error-message'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import type { Category } from '@/lib/mockData'
import { fetchCategories, fetchCategory, updateCategory } from '@/lib/mockData'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  parentId: z.string().nullable()
})

type CategoryFormData = z.infer<typeof categorySchema>

export default function EditCategoryPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema)
  })

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [category, allCategories] = await Promise.all([
          fetchCategory(params.id),
          fetchCategories()
        ])
        if (category) {
          reset({
            name: category.name,
            parentId: category.parentId
          })
          setCategories(allCategories.filter((c) => c.id !== category.id))
        } else {
          setError('Category not found')
        }
      } catch (err) {
        console.error('Error fetching category data:', err)
        setError('Failed to fetch category data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params.id, reset])

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true)
    try {
      await updateCategory(params.id, {
        name: data.name,
        parentId: data.parentId || null,
        level: data.parentId
          ? (categories.find((c) => c.id === data.parentId)?.level || 0) + 1
          : 0
      })
      toast({
        title: 'Category updated',
        description: 'The category has been successfully updated.'
      })
      router.push('/admin/categories')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update the category. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Category</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor='name'>Name</Label>
            <Input id='name' {...register('name')} />
            {errors.name && (
              <ErrorMessage message={errors.name.message || 'Error'} />
            )}
          </div>

          <div>
            <Label htmlFor='parentId'>Parent Category</Label>
            <Controller
              name='parentId'
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select parent category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>None (Root Category)</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className='flex justify-end space-x-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push('/admin/categories')}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? <LoadingSpinner /> : 'Update Category'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

