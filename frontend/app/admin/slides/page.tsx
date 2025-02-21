'use client'

import { Button } from '@/components/ui/button'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { Slide } from '@/lib/mockData'
import { deleteSlide, fetchSlides, updateSlide } from '@/lib/mockData'
import { formatDate } from '@/lib/utils'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    const loadSlides = async () => {
      const fetchedSlides = await fetchSlides()
      setSlides(fetchedSlides)
    }
    loadSlides()
  }, [])

  const filteredSlides = slides.filter((slide) =>
    slide.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleActiveToggle = async (id: string, newActive: boolean) => {
    const updatedSlide = await updateSlide(id, {
      active: newActive ? 'on' : 'off'
    })
    setSlides(slides.map((slide) => (slide.id === id ? updatedSlide : slide)))
  }

  const handleDelete = async (id: string) => {
    await deleteSlide(id)
    setSlides(slides.filter((slide) => slide.id !== id))
  }

  return (
    <div className='container mx-auto py-10'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>Slides</h1>
        <Button onClick={() => router.push('/admin/slides/new')}>
          <Plus className='mr-2 h-4 w-4' /> Add Slide
        </Button>
      </div>

      <div className='mb-4'>
        <Input
          placeholder='Search slides...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Preview</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Arrow</TableHead>
            <TableHead>Dots</TableHead>
            <TableHead>Auto Play</TableHead>
            <TableHead>Fade</TableHead>
            <TableHead>Speed</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Updated At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSlides.map((slide) => (
            <TableRow key={slide.id}>
              <TableCell>
                <div className='w-16 h-16 bg-gray-200 flex items-center justify-center'>
                  Slide
                </div>
              </TableCell>
              <TableCell>{slide.name}</TableCell>
              <TableCell>{slide.arrow}</TableCell>
              <TableCell>{slide.dots}</TableCell>
              <TableCell>{slide.auto_play}</TableCell>
              <TableCell>{slide.fade}</TableCell>
              <TableCell>{slide.speed}</TableCell>
              <TableCell>
                <Switch
                  checked={slide.active === 'on'}
                  onCheckedChange={(checked) =>
                    handleActiveToggle(slide.id, checked)
                  }
                />
              </TableCell>
              <TableCell>{formatDate(slide.created_at)}</TableCell>
              <TableCell>{formatDate(slide.updated_at)}</TableCell>
              <TableCell>
                <div className='flex space-x-2'>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() =>
                      router.push(`/admin/slides/${slide.id}/edit`)
                    }
                  >
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <ConfirmationDialog
                    title='Delete Slide'
                    message='Are you sure you want to delete this slide?'
                    onConfirm={() => handleDelete(slide.id)}
                  >
                    <Button variant='outline' size='icon'>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </ConfirmationDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredSlides.length === 0 && (
        <div className='text-center py-10'>
          <p className='text-gray-500'>No slides found.</p>
        </div>
      )}
    </div>
  )
}
