import { apiClient } from '../client'
import {
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  UserProfile,
  SkillCard,
  UserSearchRequest,
  UserSearchResponse,
} from '@/types/user'

export const userService = {
  // Profile management
  createProfile: (data: CreateUserProfileRequest): Promise<UserProfile> => {
    return apiClient.post<UserProfile>('/users', data)
  },

  getProfile: (profileId: string): Promise<UserProfile> => {
    return apiClient.get<UserProfile>(`/users/${profileId}`)
  },

  getProfileByUserId: (userId: string): Promise<UserProfile> => {
    return apiClient.get<UserProfile>(`/users/user/${userId}`)
  },

  updateProfile: (profileId: string, data: UpdateUserProfileRequest): Promise<UserProfile> => {
    return apiClient.put<UserProfile>(`/users/${profileId}`, data)
  },

  deleteProfile: (profileId: string): Promise<void> => {
    return apiClient.delete<void>(`/users/${profileId}`)
  },

  // Skill management
  addSkill: (profileId: string, skill: SkillCard): Promise<SkillCard> => {
    return apiClient.post<SkillCard>(`/users/${profileId}/skills`, skill)
  },

  updateSkill: (profileId: string, skillId: string, skill: SkillCard): Promise<SkillCard> => {
    return apiClient.put<SkillCard>(`/users/${profileId}/skills/${skillId}`, skill)
  },

  deleteSkill: (profileId: string, skillId: string): Promise<void> => {
    return apiClient.delete<void>(`/users/${profileId}/skills/${skillId}`)
  },

  // Profile image
  uploadAvatar: (profileId: string, file: File, onProgress?: (progress: number) => void): Promise<string> => {
    return apiClient.uploadFile<string>(`/users/${profileId}/avatar`, file, onProgress)
  },

  // Search
  searchProfiles: (params: UserSearchRequest): Promise<UserSearchResponse> => {
    const queryParams = new URLSearchParams()
    
    if (params.query) queryParams.append('query', params.query)
    if (params.skills) params.skills.forEach(skill => queryParams.append('skills', skill))
    if (params.minProficiencyLevel) queryParams.append('minProficiencyLevel', params.minProficiencyLevel)
    if (params.location) queryParams.append('location', params.location)
    if (params.page !== undefined) queryParams.append('page', params.page.toString())
    if (params.size !== undefined) queryParams.append('size', params.size.toString())

    return apiClient.get<UserSearchResponse>(`/users/search?${queryParams.toString()}`)
  },

  findSimilarProfiles: (skill: string, limit: number = 10): Promise<UserProfile[]> => {
    return apiClient.get<UserProfile[]>(`/users/search/similar?skill=${skill}&limit=${limit}`)
  },
}