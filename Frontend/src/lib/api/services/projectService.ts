import { apiClient } from '../client'
import type {
  Project,
  ProjectRequest,
  Task,
  TaskRequest,
  TaskMoveRequest,
  ProjectSearchParams,
} from '@/types/project'

export const projectService = {
  // Project CRUD operations
  createProject: async (data: ProjectRequest): Promise<Project> => {
    return apiClient.post<Project>('/projects', data)
  },

  getProject: async (projectId: string): Promise<Project> => {
    return apiClient.get<Project>(`/projects/${projectId}`)
  },

  getProjectsByOwner: async (ownerId: string): Promise<Project[]> => {
    return apiClient.get<Project[]>(`/projects/owner/${ownerId}`)
  },

  getAllPublicProjects: async (): Promise<Project[]> => {
    return apiClient.get<Project[]>('/projects/public')
  },

  updateProject: async (projectId: string, data: ProjectRequest): Promise<Project> => {
    return apiClient.put<Project>(`/projects/${projectId}`, data)
  },

  deleteProject: async (projectId: string): Promise<void> => {
    return apiClient.delete<void>(`/projects/${projectId}`)
  },

  // Search and discovery
  searchProjects: async (params: ProjectSearchParams): Promise<Project[]> => {
    const queryParams = new URLSearchParams()
    
    if (params.searchTerm) {
      queryParams.append('searchTerm', params.searchTerm)
    }
    
    if (params.tags && params.tags.length > 0) {
      params.tags.forEach(tag => queryParams.append('tags', tag))
    }
    
    if (params.technologies && params.technologies.length > 0) {
      params.technologies.forEach(tech => queryParams.append('technologies', tech))
    }
    
    return apiClient.get<Project[]>(`/projects/search?${queryParams.toString()}`)
  },

  discoverProjects: async (): Promise<Project[]> => {
    return apiClient.get<Project[]>('/projects/discover')
  },

  // Task operations
  createTask: async (data: TaskRequest): Promise<Task> => {
    return apiClient.post<Task>('/tasks', data)
  },

  getTask: async (taskId: string): Promise<Task> => {
    return apiClient.get<Task>(`/tasks/${taskId}`)
  },

  getTasksByColumn: async (columnId: string): Promise<Task[]> => {
    return apiClient.get<Task[]>(`/tasks/column/${columnId}`)
  },

  getTasksByProject: async (projectId: string): Promise<Task[]> => {
    return apiClient.get<Task[]>(`/tasks/project/${projectId}`)
  },

  updateTask: async (taskId: string, data: TaskRequest): Promise<Task> => {
    return apiClient.put<Task>(`/tasks/${taskId}`, data)
  },

  moveTask: async (taskId: string, data: TaskMoveRequest): Promise<Task> => {
    return apiClient.put<Task>(`/tasks/${taskId}/move`, data)
  },

  deleteTask: async (taskId: string): Promise<void> => {
    return apiClient.delete<void>(`/tasks/${taskId}`)
  },
}
