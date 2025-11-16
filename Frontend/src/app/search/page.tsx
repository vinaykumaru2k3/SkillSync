'use client'

import { UserSearchResults } from '@/components/features/search'
import { ProtectedRoute } from '@/components/auth'
import { Navigation } from '@/components/common/Navigation'

export default function SearchPage() {
  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

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
    </ProtectedRoute>
  )
}
