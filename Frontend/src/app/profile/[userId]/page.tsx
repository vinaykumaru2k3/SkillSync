'use client'

import { use } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserProfileView } from '@/components/features/profile'
import { CreateProfilePrompt } from '@/components/features/profile/CreateProfilePrompt'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { userService } from '@/lib/api/services/userService'
import { Visibility } from '@/types/user'
import { useToast } from '@/hooks/useToast'

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const { user, logout } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  
  const isOwnProfile = user?.userId === userId

  // Fetch profile
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      try {
        return await userService.getProfileByUserId(userId)
      } catch (error) {
        return null
      }
    },
    retry: false,
  })

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: (data: any) => userService.createProfile({
      userId: userId,
      displayName: data.displayName,
      bio: data.bio,
      location: data.location,
      visibility: Visibility.PUBLIC,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
      showToast('Profile created successfully!', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message, 'error')
    },
  })

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
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

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !profile && isOwnProfile ? (
          <CreateProfilePrompt
            userId={userId}
            onSubmit={(data) => createProfileMutation.mutate(data)}
            isSubmitting={createProfileMutation.isPending}
          />
        ) : !profile ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Not Found</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                This user hasn't created their profile yet.
              </p>
              <Button className="mt-4" onClick={() => router.push('/search')}>
                Discover Other Developers
              </Button>
            </div>
          </div>
        ) : (
          <UserProfileView userId={userId} editable={isOwnProfile} />
        )}
      </main>
    </div>
    </ProtectedRoute>
  )
}
