'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Link from 'next/link'
import { useEffect } from 'react'
import { FallbackProps } from 'react-error-boundary'

export default function Error({ error, resetErrorBoundary }: FallbackProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <Card className='w-[350px]'>
        <CardHeader>
          <CardTitle>Something went wrong!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-center mb-4'>
            We apologize for the inconvenience. An unexpected error has
            occurred.
          </p>
        </CardContent>
        <CardFooter className='flex justify-center space-x-2'>
          <Button onClick={resetErrorBoundary}>Try again</Button>
          <Button asChild variant='outline'>
            <Link href='/'>Go Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

