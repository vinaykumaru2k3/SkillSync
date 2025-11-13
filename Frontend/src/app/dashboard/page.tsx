'use client'

import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Create Profile Banner */}
          <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Complete Your Profile
                </h3>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  Click "My Profile" to create your profile and start connecting with other developers.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back!</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your profile and discover other developers
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* My Profile Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/profile/${user?.userId}`)}>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Profile</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    View and edit your profile, manage skills, and upload profile picture
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    View Profile →
                  </Button>
                </div>
              </div>
            </Card>

            {/* Discover Developers Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/search')}>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Discover Developers</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Search for developers by skills, location, and expertise level
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Start Searching →
                  </Button>
                </div>
              </div>
            </Card>

            {/* Account Info Card */}
            <Card>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Info</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Email:</span> {user?.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">User ID:</span> {user?.userId}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Role:</span> {user?.roles.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push(`/profile/${user?.userId}`)}
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push(`/profile/${user?.userId}`)}
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Skills
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push(`/profile/${user?.userId}`)}
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Photo
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push('/search')}
              >
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Find Developers
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
