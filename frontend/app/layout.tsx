import { Toaster } from '@/components/ui/toaster'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type React from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import Error from './error'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for e-commerce platform',
  generator: 'v0.dev'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ErrorBoundary FallbackComponent={Error}>
          {children}
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}



import './globals.css'