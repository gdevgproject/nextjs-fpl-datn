'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { ErrorMessage } from '@/components/ui/error-message'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import type { Slide, SlideGallery } from '@/lib/mockData'
import {
  createSlideGallery,
  deleteSlide,
  deleteSlideGallery,
  fetchSlideGalleries,
  fetchSlides,
  updateSlide
} from '@/lib/mockData'
import { Move, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { Controller, useForm } from 'react-hook-form'

export default function EditSlidePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [slide, setSlide] = useState<Slide | null>(null)
  const [galleries, setGalleries] = useState<SlideGallery[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true) // State for initial data loading
  const [isSaving, setIsSaving] = useState(false) // State for form submission
  const [isDeleting, setIsDeleting] = useState(false) // State for slide deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null) // Ref for the file input

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<Slide>()

  useEffect(() => {
    const fetchData = async () => {
      setIsInitialLoading(true)
      try {
        const slides = await fetchSlides()
        const currentSlide = slides.find((s) => s.id === params.id)
        if (currentSlide) {
          setSlide(currentSlide)
          reset(currentSlide) // Reset form with fetched data
          const fetchedGalleries = await fetchSlideGalleries()
          setGalleries(
            fetchedGalleries.filter((gallery) => gallery.slide_id === params.id)
          )
        } else {
          toast({
            title: 'Error',
            description: 'Slide not found',
            variant: 'destructive'
          })
          router.push('/admin/slides')
        }
      } catch (error) {
        console.error('Error fetching slide data:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch slide data',
          variant: 'destructive'
        })
      } finally {
        setIsInitialLoading(false)
      }
    }
    fetchData()
  }, [params.id, reset, router])

  const onSubmit = async (data: Slide) => {
    setIsSaving(true)
    try {
      await updateSlide(params.id, data)
      toast({ title: 'Success', description: 'Slide updated successfully' })
      router.push('/admin/slides') // Consider staying on the page to show updated data.
    } catch (error) {
      console.error('Error updating slide:', error)
      toast({
        title: 'Error',
        description: 'Failed to update slide',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteSlide(params.id)
      toast({ title: 'Success', description: 'Slide deleted successfully' })
      router.push('/admin/slides')
    } catch (error) {
      console.error('Error deleting slide:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete slide',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleRemoveGallery = async (galleryId: string) => {
    try {
      await deleteSlideGallery(galleryId)
      setGalleries(galleries.filter((gallery) => gallery.id !== galleryId))
      toast({
        title: 'Success',
        description: 'Gallery item removed successfully'
      })
    } catch (error) {
      console.error('Error removing gallery item:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove gallery item',
        variant: 'destructive'
      })
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        try {
          // Simulating file upload and creation of a new gallery item
          const newGallery = await createSlideGallery({
            slide_id: params.id,
            path: URL.createObjectURL(file), // Keep using createObjectURL for mock data
            order: galleries.length + 1,
            type: file.type.startsWith('image/') ? 'image' : 'video'
          })
          setGalleries([...galleries, newGallery])
          toast({ title: 'Success', description: 'File uploaded successfully' })
        } catch (error) {
          console.error('Error uploading file:', error)
          toast({
            title: 'Error',
            description: 'Failed to upload file',
            variant: 'destructive'
          })
        }
      }
      // Reset the input after processing files
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(galleries)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setGalleries(items)
  }

  useEffect(() => {
    // Cleanup function to revoke object URLs
    return () => {
      galleries.forEach((gallery) => {
        if (gallery.path.startsWith('blob:')) {
          // Only revoke blob URLs
          URL.revokeObjectURL(gallery.path)
        }
      })
    }
  }, [galleries]) // Run cleanup when galleries change

  if (isInitialLoading) return <LoadingSpinner />
  if (!slide) return null // This check might not be necessary if you redirect on not found

  return (
    <Card className='max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle>Edit Slide: {slide.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='general'>
          <TabsList>
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='gallery'>Gallery</TabsTrigger>
          </TabsList>
          <TabsContent value='general'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='name'>Name</Label>
                  <Controller
                    name='name'
                    control={control}
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className={errors.name ? 'border-red-500' : ''}
                      />
                    )}
                  />
                  {errors.name && (
                    <ErrorMessage message={errors.name.message || 'Error'} />
                  )}
                </div>
                <div>
                  <Label htmlFor='speed'>Speed (ms)</Label>
                  <Controller
                    name='speed'
                    control={control}
                    rules={{ required: 'Speed is required', min: 0 }}
                    render={({ field }) => (
                      <Input
                        type='number'
                        {...field}
                        className={errors.speed ? 'border-red-500' : ''}
                      />
                    )}
                  />
                  {errors.speed && (
                    <ErrorMessage message={errors.speed.message || 'Error'} />
                  )}
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex items-center space-x-2'>
                  <Controller
                    name='arrow'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value === 'on'}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 'on' : 'off')
                        }
                      />
                    )}
                  />
                  <Label htmlFor='arrow'>Show Arrows</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Controller
                    name='dots'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value === 'on'}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 'on' : 'off')
                        }
                      />
                    )}
                  />
                  <Label htmlFor='dots'>Show Dots</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Controller
                    name='auto_play'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value === 'on'}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 'on' : 'off')
                        }
                      />
                    )}
                  />
                  <Label htmlFor='auto_play'>Auto Play</Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <Controller
                    name='fade'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value === 'on'}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 'on' : 'off')
                        }
                      />
                    )}
                  />
                  <Label htmlFor='fade'>Fade Effect</Label>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <Controller
                  name='active'
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value === 'on'}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? 'on' : 'off')
                      }
                    />
                  )}
                />
                <Label htmlFor='active'>Active</Label>
              </div>
            </form>
          </TabsContent>
          <TabsContent value='gallery'>
            <div className='space-y-4'>
              <div>
                {/* Use a button to trigger the hidden file input */}
                <Button asChild variant='outline'>
                  <Label
                    htmlFor='file-upload'
                    className='cursor-pointer flex items-center gap-2'
                  >
                    <Upload className='h-4 w-4' />
                    Choose Files
                  </Label>
                </Button>
                <input
                  type='file'
                  id='file-upload'
                  multiple
                  onChange={handleFileUpload}
                  className='hidden'
                  ref={fileInputRef}
                />
              </div>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId='galleries'>
                  {(provided) => (
                    <ul
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className='space-y-2'
                    >
                      {galleries.map((gallery, index) => (
                        <Draggable
                          key={gallery.id}
                          draggableId={gallery.id}
                          index={index}
                        >
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className='flex items-center justify-between bg-white p-2 rounded-lg shadow'
                            >
                              <div className='flex items-center space-x-2'>
                                <Move className='h-5 w-5 text-gray-500' />
                                <Image
                                  src={gallery.path || '/placeholder.svg'}
                                  alt={`Slide ${index + 1}`}
                                  width={50}
                                  height={50}
                                  className='rounded object-cover'
                                />
                                <span>{gallery.path.split('/').pop()}</span>
                              </div>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleRemoveGallery(gallery.id)}
                              >
                                <Trash2 className='h-5 w-5 text-red-500' />
                              </Button>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className='flex justify-between'>
        {/* Single Delete Button */}
        <Button
          variant='destructive'
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Slide'}
        </Button>
        <div className='space-x-2'>
          <Button
            variant='outline'
            onClick={() => router.push('/admin/slides')}
          >
            Cancel
          </Button>
          {/* Save Changes Button */}
          <Button onClick={handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardFooter>

      {/* Confirmation Dialog -  Simplified */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title='Delete Slide'
        message='Are you sure you want to delete this slide? This action cannot be undone.'
      />
    </Card>
  )
}
