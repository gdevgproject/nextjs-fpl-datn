// app/(auth)/login/page.tsx
'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
// import { redirect } from 'next/navigation'; // REMOVE redirect import
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation' // Import useRouter

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const router = useRouter() // Get the router instance

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <Card className='w-[350px]'>
        <CardHeader>
          <CardTitle>Login to Perfume Paradise</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#4F46E5',
                    brandAccent: '#4338CA',
                    inputBackground: '#F3F4F6',
                    inputText: '#1F2937'
                  }
                }
              }
            }}
            providers={['google', 'facebook', 'github', 'apple']}
            redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`}
            onlyThirdPartyProviders={false}
          />
        </CardContent>
        <CardFooter className='flex flex-col space-y-2'>
          <Link
            href='/forgot-password'
            className='text-sm text-blue-500 hover:underline self-end'
          >
            Forgot password?
          </Link>
          <p className='text-sm text-center w-full'>
            Don't have an account?{' '}
            <Link href='/register' className='text-blue-500 hover:underline'>
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
