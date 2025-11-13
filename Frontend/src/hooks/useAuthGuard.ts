'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface UseAuthGuardOptions {
  requiredRoles?: string[]
  redirectTo?: string
}

/**
 * Hook to guard routes and redirect if not authenticated or authorized
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { requiredRoles = [], redirectTo = '/login' } = options
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) => user?.roles.includes(role))
      if (!hasRequiredRole) {
        router.push('/unauthorized')
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, redirectTo, router])

  return { user, isAuthenticated, isLoading }
}
