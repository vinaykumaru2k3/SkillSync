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
    // Redirect directly to Spring Security's OAuth2 endpoint
    window.location.href = 'http://localhost:8081/oauth2/authorization/github'
  },
}
