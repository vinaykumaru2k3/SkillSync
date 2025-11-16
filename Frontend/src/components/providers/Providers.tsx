'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider>
          <AuthProvider>
            <WebSocketProvider>{children}</WebSocketProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
