'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/common/Spinner'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken')
        const refreshToken = searchParams.get('refreshToken')
        const userId = searchParams.get('userId')
        const email = searchParams.get('email')
        const error = searchParams.get('error')

        console.log('OAuth callback received:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasUserId: !!userId,
          hasEmail: !!email,
          error
        })

        if (error) {
          console.error('OAuth error:', error)
          router.push('/login?error=oauth_failed')
          return
        }

        if (!accessToken || !refreshToken || !userId || !email) {
          console.error('Missing OAuth parameters. Received:', {
            accessToken: accessToken ? 'present' : 'missing',
            refreshToken: refreshToken ? 'present' : 'missing',
            userId: userId ? 'present' : 'missing',
            email: email ? 'present' : 'missing'
          })
          router.push('/login?error=invalid_callback')
          return
        }

        // Store auth data
        localStorage.setItem('auth_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        localStorage.setItem('user', JSON.stringify({
          userId,
          email,
          roles: ['USER']
        }))

        // Redirect to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Error handling OAuth callback:', error)
        router.push('/login?error=callback_failed')
      }
    }

    handleOAuthCallback()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Completing sign in...
        </p>
      </div>
    </div>
  )
}
