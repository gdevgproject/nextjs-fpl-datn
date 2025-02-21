'use client'

import type React from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ErrorMessage } from '@/components/ui/error-message'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import type { Slide, SlideGallery } from '@/lib/mockData'
import { createSlide, createSlideGallery } from '@/lib/mockData'
import { Move, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { Controller, useForm } from 'react-hook-form'

export default function NewSlidePage() {
  const router = useRouter()
  const [galleries, setGalleries] = useState<SlideGallery[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<Slide>({
    defaultValues: {
      name: '',
      arrow: 'off',
      dots: 'off',
      auto_play: 'off',
      fade: 'off',
      speed: 3000,
      active: 'on'
    }
  })

  const onSubmit = async (data: Slide) => {
    setIsLoading(true)
    try {
      const newSlide = await createSlide(data)
      for (const gallery of galleries) {
        await createSlideGallery({ ...gallery, slide_id: newSlide.id })
      }
      toast({ title: 'Success', description: 'Slide created successfully' })
      router.push('/admin/slides')
    } catch (error) {
      console.error('Error creating slide:', error)
      toast({
        title: 'Error',
        description: 'Failed to create slide',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        try {
          // Simulating file upload and creation of a new gallery item
          const newGallery: SlideGallery = {
            id: `temp-${Date.now()}-${i}`,
            slide_id: '',
            path: URL.createObjectURL(file),
            order: galleries.length + 1,
            type: file.type.startsWith('image/') ? 'image' : 'video'
          }
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
    }
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(galleries)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setGalleries(items)
  }

  return (
    <Card className='max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle>Create New Slide</CardTitle>
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
                    render={({ field }) => <Input {...field} />}
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
                    render={({ field }) => <Input type='number' {...field} />}
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
                <Label htmlFor='file-upload' className='cursor-pointer'>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                    <Upload className='mx-auto h-12 w-12 text-gray-400' />
                    <p className='mt-1 text-sm text-gray-600'>
                      Click to upload or drag and drop
                    </p>
                    <p className='mt-1 text-xs text-gray-500'>
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <Input
                    id='file-upload'
                    type='file'
                    multiple
                    onChange={handleFileUpload}
                    className='hidden'
                  />
                </Label>
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
                                  objectFit='cover'
                                  className='rounded'
                                />
                                <span>{gallery.path.split('/').pop()}</span>
                              </div>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  setGalleries(
                                    galleries.filter((g) => g.id !== gallery.id)
                                  )
                                }
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
      <CardFooter className='flex justify-end space-x-2'>
        <Button variant='outline' onClick={() => router.push('/admin/slides')}>
          Cancel
        </Button>
        <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Slide'}
        </Button>
      </CardFooter>
    </Card>
  )
}
