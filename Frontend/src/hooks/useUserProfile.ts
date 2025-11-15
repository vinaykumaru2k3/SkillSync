import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/lib/api/services/userService'
import { useAuth } from '@/contexts/AuthContext'
import { CreateUserProfileRequest } from '@/types/user'

export function useUserProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['userProfile', user?.userId],
    queryFn: async () => {
      if (!user?.userId) throw new Error('No user ID')
      return await userService.getProfileByUserId(user.userId)
    },
    enabled: !!user?.userId,
    retry: false,
    throwOnError: false,
  })

  const createProfileMutation = useMutation({
    mutationFn: (data: CreateUserProfileRequest) => userService.createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.userId] })
    },
  })

  const hasProfile = !!profile && !error
  const needsProfile = !isLoading && (!profile || error) && !!user

  return {
    profile,
    isLoading,
    error,
    hasProfile,
    needsProfile,
    createProfile: createProfileMutation.mutate,
    isCreatingProfile: createProfileMutation.isPending,
  }
}
