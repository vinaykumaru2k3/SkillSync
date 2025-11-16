import { apiClient } from './client'
import {
  Collaboration,
  InvitationRequest,
  InvitationResponse,
  ProjectPermissions,
} from '@/types/collaboration'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  timestamp: string
}

export const collaborationApi = {
  // Create invitation
  createInvitation: async (request: InvitationRequest): Promise<InvitationResponse> => {
    const response = await apiClient.post<ApiResponse<InvitationResponse>>(
      '/collaborations/invites',
      request
    )
    return response.data
  },

  // Accept invitation
  acceptInvitation: async (invitationId: string): Promise<InvitationResponse> => {
    const response = await apiClient.post<ApiResponse<InvitationResponse>>(
      `/collaborations/invites/${invitationId}/accept`
    )
    return response.data
  },

  // Decline invitation
  declineInvitation: async (invitationId: string): Promise<InvitationResponse> => {
    const response = await apiClient.post<ApiResponse<InvitationResponse>>(
      `/collaborations/invites/${invitationId}/decline`
    )
    return response.data
  },

  // Revoke collaboration
  revokeCollaboration: async (collaborationId: string): Promise<void> => {
    await apiClient.delete(`/collaborations/${collaborationId}`)
  },

  // Get project collaborators
  getProjectCollaborators: async (projectId: string): Promise<Collaboration[]> => {
    const response = await apiClient.get<ApiResponse<Collaboration[]>>(
      `/collaborations/projects/${projectId}`
    )
    return response.data
  },

  // Get enriched project collaborators
  getEnrichedProjectCollaborators: async (projectId: string, ownerId?: string): Promise<any[]> => {
    const url = ownerId 
      ? `/collaborations/projects/${projectId}/enriched?ownerId=${ownerId}`
      : `/collaborations/projects/${projectId}/enriched`
    const response = await apiClient.get<ApiResponse<any[]>>(url)
    return response.data
  },

  // Get pending invitations
  getPendingInvitations: async (): Promise<Collaboration[]> => {
    const response = await apiClient.get<ApiResponse<Collaboration[]>>(
      '/collaborations/invites/pending'
    )
    return response.data
  },

  // Get enriched pending invitations
  getEnrichedPendingInvitations: async (): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(
      '/collaborations/invites/pending/enriched'
    )
    return response.data
  },

  // Get sent invitations
  getSentInvitations: async (): Promise<Collaboration[]> => {
    const response = await apiClient.get<ApiResponse<Collaboration[]>>(
      '/collaborations/invites/sent'
    )
    return response.data
  },

  // Get collaboration details
  getCollaboration: async (collaborationId: string): Promise<Collaboration> => {
    const response = await apiClient.get<ApiResponse<Collaboration>>(
      `/collaborations/${collaborationId}`
    )
    return response.data
  },

  // Check permissions
  checkPermissions: async (projectId: string): Promise<ProjectPermissions> => {
    const response = await apiClient.get<ApiResponse<ProjectPermissions>>(
      `/collaborations/projects/${projectId}/permissions`
    )
    return response.data
  },
}
