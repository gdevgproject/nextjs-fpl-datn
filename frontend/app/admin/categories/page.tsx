'use client'

import React from 'react'
import { useState, useEffect } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorMessage } from '@/components/ui/error-message'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { fetchCategories, deleteCategory } from '@/lib/mockData'
import type { Category } from '@/lib/mockData'
import { toast } from '@/components/ui/use-toast'
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    categoryId: string | null
  }>({
    isOpen: false,
    categoryId: null
  })
  const itemsPerPage = 10
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedCategories = await fetchCategories()
      setCategories(fetchedCategories)
    } catch (err) {
      setError('Failed to fetch categories. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    setDeleteConfirmation({
      isOpen: true,
      categoryId
    })
  }

  const confirmDelete = async () => {
    if (deleteConfirmation.categoryId) {
      setIsLoading(true)
      setError(null)
      try {
        await deleteCategory(deleteConfirmation.categoryId)
        setCategories(
          categories.filter(
            (category) => category.id !== deleteConfirmation.categoryId
          )
        )
        toast({
          title: 'Category deleted',
          description: 'The category has been successfully deleted.'
        })
      } catch (err) {
        setError('Failed to delete category. Please try again.')
      } finally {
        setIsLoading(false)
        setDeleteConfirmation({ isOpen: false, categoryId: null })
      }
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderCategoryTree = (parentId: string | null = null, level = 0) => {
    const filteredCategories = categories
      .filter((category) => category.parentId === parentId)
      .filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedCategories = filteredCategories.slice(startIndex, endIndex)

    return paginatedCategories.map((category) => (
      <React.Fragment key={category.id}>
        <TableRow>
          <TableCell>
            <div
              className='flex items-center'
              style={{ paddingLeft: `${level * 20}px` }}
            >
              {filteredCategories.some((c) => c.parentId === category.id) ? (
                <ChevronRight className='mr-2' />
              ) : (
                <ChevronDown className='mr-2' />
              )}
              {category.name}
            </div>
          </TableCell>
          <TableCell>{category.level}</TableCell>
          <TableCell>
            {new Date(category.created_at).toLocaleString()}
          </TableCell>
          <TableCell>
            {new Date(category.updated_at).toLocaleString()}
          </TableCell>
          <TableCell>
            <div className='flex space-x-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() =>
                  router.push(`/admin/categories/${category.id}/edit`)
                }
              >
                <Pencil className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleDeleteCategory(category.id)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {renderCategoryTree(category.id, level + 1)}
      </React.Fragment>
    ))
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Categories</h1>
        <Button asChild>
          <Link href='/admin/categories/new'>
            <Plus className='mr-2 h-4 w-4' /> Add Category
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            <Input
              placeholder='Search categories...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderCategoryTree()}</TableBody>
          </Table>
          <div className='mt-4'>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  />
                </PaginationItem>
                {Array.from(
                  {
                    length: Math.ceil(filteredCategories.length / itemsPerPage)
                  },
                  (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(filteredCategories.length / itemsPerPage)
                        )
                      )
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({ isOpen: false, categoryId: null })
        }
        onConfirm={confirmDelete}
        title='Delete Category'
        description='Are you sure you want to delete this category? This action cannot be undone.'
      />
    </div>
  )
}

