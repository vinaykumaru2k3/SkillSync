import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1'

class ApiClient {
  private client: AxiosInstance
  private isLoggingOut: boolean = false

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[API Request]', {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
            headers: {
              'Authorization': config.headers.Authorization ? 'Bearer ***' : undefined,
              'X-User-Id': config.headers['X-User-Id']
            }
          })
        }

        return config
      },
      (error) => {
        console.error('[API Request Error]', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[API Response]', {
            status: response.status,
            url: response.config.url,
            data: response.data,
          })
        }

        return response
      },
      async (error: AxiosError) => {
        // Log error in development (but suppress 404 for profile endpoints)
        if (process.env.NODE_ENV === 'development') {
          const isProfileNotFound = error.response?.status === 404 && 
            error.config?.url?.includes('/users/user/')
          
          if (!isProfileNotFound) {
            console.error('[API Response Error]', {
              status: error.response?.status,
              url: error.config?.url,
              message: error.message,
              data: error.response?.data,
              fullError: error,
            })
          }
        }

        // Handle 401 Unauthorized - token expired (but not during logout)
        if (error.response?.status === 401 && !this.isLoggingOut) {
          this.handleUnauthorized()
        }

        // Transform error to user-friendly message
        const errorMessage = this.getErrorMessage(error)
        return Promise.reject(new Error(errorMessage))
      }
    )
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  private getUserIdFromToken(token: string): string | null {
    try {
      // Decode JWT token (just the payload, no verification needed on client)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userId = payload.userId || payload.user_id || payload.sub || null
      return userId
    } catch (error) {
      console.error('Failed to decode JWT token:', error)
      return null
    }
  }

  private async handleUnauthorized() {
    if (typeof window === 'undefined') return

    // Try to refresh token
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      try {
        const response = await this.client.post('/auth/token/refresh', { refreshToken })
        if (response.data.accessToken) {
          this.setAuthToken(response.data.accessToken)
          localStorage.setItem('refresh_token', response.data.refreshToken)
          return
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
      }
    }

    // Clear auth data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    // Redirect to landing page
    window.location.href = '/'
  }

  private getErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as any
      
      // Handle structured error response
      if (data.error?.message) {
        return data.error.message
      }
      
      if (data.message) {
        return data.message
      }
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.'
    }

    if (error.message === 'Network Error') {
      return 'Network error. Please check your connection.'
    }

    // Default error messages by status code
    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your input.'
      case 401:
        return 'Authentication required. Please log in.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 409:
        return 'A conflict occurred. The resource may already exist.'
      case 500:
        return 'Server error. Please try again later.'
      case 503:
        return 'Service temporarily unavailable. Please try again later.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // Mark if this is a logout request
    if (url === '/auth/logout') {
      this.isLoggingOut = true
    }
    
    try {
      const response = await this.client.post<T>(url, data, config)
      return response.data
    } finally {
      // Reset logout flag
      if (url === '/auth/logout') {
        this.isLoggingOut = false
      }
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  // File upload helper
  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }

    const response = await this.client.post<T>(url, formData, config)
    return response.data
  }

  // Set auth token
  setAuthToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  // Clear auth token
  clearAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
