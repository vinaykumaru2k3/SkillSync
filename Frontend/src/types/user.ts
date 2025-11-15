export enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export interface SkillCard {
  id?: string
  name: string
  proficiencyLevel: ProficiencyLevel
  yearsOfExperience: number
}

export interface UserProfile {
  id: string
  userId: string
  username: string
  displayName: string
  bio?: string
  location?: string
  website?: string
  profileImageUrl?: string
  visibility: Visibility
  skills: SkillCard[]
  socialLinks: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface CreateUserProfileRequest {
  userId: string
  username: string
  displayName: string
  bio?: string
  location?: string
  website?: string
  visibility?: Visibility
  socialLinks?: Record<string, string>
}

export interface UpdateUserProfileRequest {
  username?: string
  displayName?: string
  bio?: string
  location?: string
  website?: string
  visibility?: Visibility
  socialLinks?: Record<string, string>
  profileImageUrl?: string
}

export interface UserSearchRequest {
  query?: string
  skills?: string[]
  minProficiencyLevel?: ProficiencyLevel
  location?: string
  page?: number
  size?: number
}

export interface UserSearchResponse {
  profiles: UserProfile[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
