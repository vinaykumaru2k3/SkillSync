export interface User {
  userId: string
  email: string
  roles: string[]
}

export interface AuthResponse {
  userId: string
  email: string
  accessToken: string
  refreshToken: string
  roles: string[]
  expiresIn: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (credentials: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  loginWithGithub: () => void
}
