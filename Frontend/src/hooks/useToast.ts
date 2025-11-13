'use client'

import { useState, useCallback } from 'react'
import { ToastMessage, ToastType } from '@/components/common/Toast'

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = Math.random().toString(36).substring(7)
    const toast: ToastMessage = { id, type, message, duration }
    
    setToasts((prev) => [...prev, toast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback((message: string, duration?: number) => {
    showToast('success', message, duration)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    showToast('error', message, duration)
  }, [showToast])

  const warning = useCallback((message: string, duration?: number) => {
    showToast('warning', message, duration)
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    showToast('info', message, duration)
  }, [showToast])

  return {
    toasts,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}
