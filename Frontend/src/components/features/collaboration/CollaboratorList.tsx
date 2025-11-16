'use client'

import { useEffect, useState } from 'react'
import { collaborationApi } from '@/lib/api/collaboration'
import { Collaboration, CollaborationRole, CollaborationStatus } from '@/types/collaboration'
import { useToast } from '@/contexts/ToastContext'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

interface CollaboratorListProps {
  projectId: string
  isOwner: boolean
  ownerId?: string
  onRefresh?: number
}

export default function CollaboratorList({ projectId, isOwner, ownerId, onRefresh }: CollaboratorListProps) {
  const [collaborators, setCollaborators] = useState<Collaboration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; collaborationId: string; displayName: string }>({ isOpen: false, collaborationId: '', displayName: '' })
  const { showToast } = useToast()

  useEffect(() => {
    loadCollaborators()
  }, [projectId, onRefresh])

  const loadCollaborators = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await collaborationApi.getEnrichedProjectCollaborators(projectId, ownerId)
      setCollaborators(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collaborators')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeClick = (collaborationId: string, displayName: string) => {
    setConfirmDialog({ isOpen: true, collaborationId, displayName })
  }

  const handleRevokeConfirm = async () => {
    try {
      await collaborationApi.revokeCollaboration(confirmDialog.collaborationId)
      showToast('Collaborator removed successfully', 'success')
      loadCollaborators()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to revoke collaboration', 'error')
    }
  }

  const getRoleBadgeColor = (role: CollaborationRole) => {
    switch (role) {
      case CollaborationRole.EDITOR:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case CollaborationRole.VIEWER:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (collaborators.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No collaborators yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {collaborators.map((collab) => (
        <div
          key={collab.id}
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {(collab as any).inviteeProfileImageUrl ? (
                <img
                  src={(collab as any).inviteeProfileImageUrl}
                  alt={(collab as any).inviteeDisplayName || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {((collab as any).inviteeDisplayName || 'U').substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {(collab as any).inviteeDisplayName || `User ${collab.inviteeId.substring(0, 8)}...`}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {(collab as any).inviteeUsername && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      @{(collab as any).inviteeUsername}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(
                      collab.role
                    )}`}
                  >
                    {collab.role}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Joined {new Date(collab.respondedAt || collab.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={() => handleRevokeClick(collab.id, (collab as any).inviteeDisplayName || 'this user')}
              className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            >
              Revoke
            </button>
          )}
        </div>
      ))}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, collaborationId: '', displayName: '' })}
        onConfirm={handleRevokeConfirm}
        title="Remove Collaborator"
        message={`Are you sure you want to remove ${confirmDialog.displayName} from this project? This action cannot be undone.`}
        confirmText="Remove"
        variant="danger"
      />
    </div>
  )
}
