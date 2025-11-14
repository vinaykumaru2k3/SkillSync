'use client'

import { useEffect, useRef } from 'react'
import { apiClient } from '@/lib/api/client'

/**
 * Hook to automatically refresh tokens before they expire
 * Checks token expiration and refreshes proactively
 */
export function useTokenRefresh() {
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const scheduleTokenRefresh = () => {
      // Clear any existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      const token = localStorage.getItem('auth_token')
      if (!token) return

      try {
        // Decode JWT to get expiration
        const payload = JSON.parse(atob(token.split('.')[1]))
        const expiresAt = payload.exp * 1000 // Convert to milliseconds
        const now = Date.now()
        const timeUntilExpiry = expiresAt - now

        // Refresh 5 minutes before expiration
        const refreshTime = timeUntilExpiry - (5 * 60 * 1000)

        if (refreshTime > 0) {
          console.log(`Token will be refreshed in ${Math.round(refreshTime / 1000 / 60)} minutes`)
          
          refreshTimeoutRef.current = setTimeout(async () => {
            await refreshToken()
            scheduleTokenRefresh() // Schedule next refresh
          }, refreshTime)
        } else {
          // Token already expired or will expire soon, refresh now
          refreshToken().then(() => scheduleTokenRefresh())
        }
      } catch (error) {
        console.error('Error scheduling token refresh:', error)
      }
    }

    const refreshToken = async () => {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) return

      try {
        console.log('Refreshing access token...')
        const response = await apiClient.post<{
          accessToken: string
          refreshToken: string
        }>('/auth/token/refresh', { refreshToken })

        if (response.accessToken) {
          localStorage.setItem('auth_token', response.accessToken)
          localStorage.setItem('refresh_token', response.refreshToken)
          console.log('Token refreshed successfully')
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
        // Clear auth data and redirect to login
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/'
      }
    }

    // Start the refresh cycle
    scheduleTokenRefresh()

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])
}
