'use client'

import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/common/Button'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-bold">SkillSync</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-2xl font-bold">Welcome to your Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">
              You are successfully authenticated!
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-500">
                User ID: {user?.userId}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Roles: {user?.roles.join(', ')}
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
