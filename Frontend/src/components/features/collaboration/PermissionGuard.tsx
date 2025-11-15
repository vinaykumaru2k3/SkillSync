'use client'

import { ReactNode } from 'react'
import { useProjectPermissions } from '@/hooks/useProjectPermissions'

interface PermissionGuardProps {
  projectId: string
  requirePermission?: 'read' | 'write' | 'delete'
  fallback?: ReactNode
  children: ReactNode
}

export default function PermissionGuard({
  projectId,
  requirePermission,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { permissions, isLoading } = useProjectPermissions(projectId)

  if (isLoading) {
    return <>{fallback}</>
  }

  // Check if user has required permission
  let hasPermission = false

  switch (requirePermission) {
    case 'read':
      hasPermission = permissions.canRead
      break
    case 'write':
      hasPermission = permissions.canWrite
      break
    case 'delete':
      hasPermission = permissions.canDelete
      break
    default:
      hasPermission = permissions.isCollaborator
  }

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
