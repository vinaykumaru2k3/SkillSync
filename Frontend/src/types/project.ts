export enum ProjectVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface Task {
  id: string
  title: string
  description?: string
  assigneeId?: string
  creatorId: string
  creatorUsername: string
  creatorProfileImageUrl?: string
  labels: string[]
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  position: number
  columnId: string
  createdAt: string
  updatedAt: string
}

export interface BoardColumn {
  id: string
  name: string
  position: number
  tasks: Task[]
}

export interface Project {
  id: string
  ownerId: string
  name: string
  description?: string
  visibility: ProjectVisibility
  tags: string[]
  technologies: string[]
  repositoryUrl?: string
  columns: BoardColumn[]
  createdAt: string
  updatedAt: string
}

export interface ProjectRequest {
  name: string
  description?: string
  visibility: ProjectVisibility
  tags?: string[]
  technologies?: string[]
  repositoryUrl?: string
}

export interface TaskRequest {
  title: string
  description?: string
  assigneeId?: string
  labels?: string[]
  priority: TaskPriority
  status: TaskStatus
  dueDate?: string
  columnId: string
}

export interface TaskMoveRequest {
  targetColumnId: string
  position: number
}

export interface ProjectSearchParams {
  searchTerm?: string
  tags?: string[]
  technologies?: string[]
}
