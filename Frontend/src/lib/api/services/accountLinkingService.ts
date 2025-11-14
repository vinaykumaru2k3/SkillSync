import { apiClient } from '../client'

export interface LinkedProvidersResponse {
  email: string
  hasPassword: boolean
  hasOAuth: boolean
  linkedProviders: string[]
  canUnlinkProvider: boolean
}

export interface UnlinkProviderResponse {
  message: string
  provider: string
}

export const accountLinkingService = {
  /**
   * Get current user's linked authentication providers
   */
  getLinkedProviders: (): Promise<LinkedProvidersResponse> => {
    return apiClient.get<LinkedProvidersResponse>('/auth/account/linked-providers')
  },

  /**
   * Unlink an OAuth provider from the current user's account
   * Only allowed if user has password or other OAuth providers
   */
  unlinkProvider: (provider: string): Promise<UnlinkProviderResponse> => {
    return apiClient.delete<UnlinkProviderResponse>(`/auth/account/unlink/${provider}`)
  },
}
