'use client'

import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Bell, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Header() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    } else {
      router.refresh() // Refresh client to update auth state
      router.push('/login')
    }
  }

  return (
    <header className='flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200'>
      <h1 className='text-2xl font-semibold text-gray-800'>Dashboard</h1>
      <div className='flex items-center'>
        <Button variant='ghost' size='icon' className='mr-2'>
          <Bell className='h-5 w-5' />
        </Button>
        <Button variant='ghost' size='icon' onClick={handleLogout}>
          <LogOut className='h-5 w-5' />
        </Button>
      </div>
    </header>
  )
}
