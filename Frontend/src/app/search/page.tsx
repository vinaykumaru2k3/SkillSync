'use client'

import { UserSearchResults } from '@/components/features/search'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/common/Button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SearchPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard">
                <h1 className="text-xl font-bold cursor-pointer hover:text-blue-600">SkillSync</h1>
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Dashboard
                </Link>
                <Link href={`/profile/${user?.userId}`} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  My Profile
                </Link>
                <Link href="/search" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Discover
                </Link>
              </div>
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Discover Developers
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Find developers by skills, location, and expertise level
          </p>
        </div>

        <UserSearchResults />
      </main>
    </div>
  )
}
