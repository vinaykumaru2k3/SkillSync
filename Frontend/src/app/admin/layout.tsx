'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Spinner } from '@/components/common/Spinner'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login')
            } else if (!user.roles.includes('ROLE_ADMIN')) {
                // For development/demo purposes, we might want to allow access or show a message
                // router.push('/dashboard') 
                console.warn('User is not admin but accessing admin panel (Dev mode)')
            }
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
