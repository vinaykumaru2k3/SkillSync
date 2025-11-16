'use client'

import { use } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserProfileView } from '@/components/features/profile'
import { CreateProfilePrompt } from '@/components/features/profile/CreateProfilePrompt'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { Navigation } from '@/components/common/Navigation'
import { useRouter } from 'next/navigation'
import { userService } from '@/lib/api/services/userService'
import { Visibility } from '@/types/user'
import { useToast } from '@/contexts/ToastContext'

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
      userId: user!.userId,
      username: data.username,
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

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {!isOwnProfile && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : !profile && isOwnProfile ? (
          <CreateProfilePrompt
            userId={user!.userId}
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
