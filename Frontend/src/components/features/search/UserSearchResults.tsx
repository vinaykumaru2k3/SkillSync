'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { userService } from '@/lib/api/services/userService'
import { UserSearchRequest } from '@/types/user'
import { UserProfileCard } from './UserProfileCard'
import { UserSearchFilters } from './UserSearchFilters'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'

export function UserSearchResults() {
  const [searchParams, setSearchParams] = useState<UserSearchRequest | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['userSearch', searchParams],
    queryFn: () => userService.searchProfiles(searchParams!),
    enabled: searchParams !== null,
  })

  const handleSearch = (filters: Omit<UserSearchRequest, 'page' | 'size'>) => {
    setSearchParams({
      ...filters,
      page: 0,
      size: 20,
    })
  }

  const handlePageChange = (newPage: number) => {
    if (searchParams) {
      setSearchParams({
        ...searchParams,
        page: newPage,
      })
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-1">
        <UserSearchFilters onSearch={handleSearch} />
      </div>

      <div className="lg:col-span-3">
        {!searchParams ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              Start Your Search
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Use the filters on the left to search for developers by skills, location, or expertise level
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">
              {error instanceof Error ? error.message : 'Failed to load search results'}
            </p>
          </div>
        ) : data && data.profiles.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Found {data.totalElements} {data.totalElements === 1 ? 'developer' : 'developers'}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {data.profiles.map((profile) => (
                <UserProfileCard key={profile.id} profile={profile} />
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(data.page - 1)}
                  disabled={data.page === 0}
                >
                  Previous
                </Button>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {data.page + 1} of {data.totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(data.page + 1)}
                  disabled={data.page >= data.totalPages - 1}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No developers found
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Try adjusting your search filters to find more results
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
