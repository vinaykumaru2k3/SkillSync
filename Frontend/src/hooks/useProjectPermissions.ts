'use client'

import { useEffect, useState } from 'react'
import { collaborationApi } from '@/lib/api/collaboration'
import { ProjectPermissions } from '@/types/collaboration'

export function useProjectPermissions(projectId: string | null) {
  const [permissions, setPermissions] = useState<ProjectPermissions>({
    isCollaborator: false,
    canRead: false,
    canWrite: false,
    canDelete: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setIsLoading(false)
      return
    }

    loadPermissions()
  }, [projectId])

  const loadPermissions = async () => {
    if (!projectId) return

    try {
      setIsLoading(true)
      setError(null)
      const data = await collaborationApi.checkPermissions(projectId)
      setPermissions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions')
      // Set default permissions on error
      setPermissions({
        isCollaborator: false,
        canRead: false,
        canWrite: false,
        canDelete: false,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    permissions,
    isLoading,
    error,
    refresh: loadPermissions,
  }
}
