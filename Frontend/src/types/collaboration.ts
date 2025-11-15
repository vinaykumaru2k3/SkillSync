export enum CollaborationRole {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
}

export enum CollaborationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  REVOKED = 'REVOKED',
}

export enum Permission {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
}

export interface Collaboration {
  id: string
  projectId: string
  inviterId: string
  inviteeId: string
  role: CollaborationRole
  status: CollaborationStatus
  permissions: Permission[]
  invitedAt: string
  respondedAt?: string
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface InvitationRequest {
  projectId: string
  inviteeId: string
  role: CollaborationRole
}

export interface InvitationResponse {
  message: string
  collaboration: Collaboration
}

export interface ProjectPermissions {
  isCollaborator: boolean
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
}
