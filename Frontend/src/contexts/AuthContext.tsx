'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '@/lib/api/services/authService'
import type { User, AuthContextType, LoginRequest, RegisterRequest } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY)
        const userData = localStorage.getItem(USER_KEY)

        if (token && userData) {
          setUser(JSON.parse(userData))
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error)
        clearAuthData()
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const saveAuthData = useCallback((accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem(TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    setUser(userData)
  }, [])

  const clearAuthData = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials)
      
      const userData: User = {
        userId: response.userId,
        email: response.email,
        roles: response.roles,
      }

      saveAuthData(response.accessToken, response.refreshToken, userData)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }, [saveAuthData])

  const register = useCallback(async (credentials: RegisterRequest) => {
    try {
      const response = await authService.register(credentials)
      
      const userData: User = {
        userId: response.userId,
        email: response.email,
        roles: response.roles,
      }

      saveAuthData(response.accessToken, response.refreshToken, userData)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }, [saveAuthData])

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      clearAuthData()
    }
  }, [clearAuthData])

  const refreshToken = useCallback(async () => {
    try {
      const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!refreshTokenValue) {
        throw new Error('No refresh token available')
      }

      const response = await authService.refreshToken({ refreshToken: refreshTokenValue })
      
      const userData: User = {
        userId: response.userId,
        email: response.email,
        roles: response.roles,
      }

      saveAuthData(response.accessToken, response.refreshToken, userData)
    } catch (error) {
      console.error('Token refresh failed:', error)
      clearAuthData()
      throw error
    }
  }, [saveAuthData, clearAuthData])

  const loginWithGithub = useCallback(() => {
    authService.loginWithGithub()
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    loginWithGithub,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
