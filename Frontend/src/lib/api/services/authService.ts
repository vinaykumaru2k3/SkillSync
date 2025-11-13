import { apiClient } from '../client'
import type { AuthResponse, LoginRequest, RegisterRequest, RefreshTokenRequest } from '@/types/auth'

export const authService = {
  /**
   * Register a new user
   */
  register: async (credentials: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', credentials)
  },

  /**
   * Login user with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', credentials)
  },

  /**
   * Logout user
   */
  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout', { refreshToken })
  },

  /**
   * Refresh access token
   */
  refreshToken: async (request: RefreshTokenRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/token/refresh', request)
  },

  /**
   * Initiate GitHub OAuth login
   */
  loginWithGithub: (): void => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1'
    window.location.href = `${apiBaseUrl}/auth/oauth/github/login`
  },
}
