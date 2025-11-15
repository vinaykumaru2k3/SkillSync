'use client'

import { useState } from 'react'
import InviteCollaboratorModal from './InviteCollaboratorModal'
import CollaboratorList from './CollaboratorList'

interface CollaborationManagerProps {
  projectId: string
  isOwner: boolean
}

export default function CollaborationManager({ projectId, isOwner }: CollaborationManagerProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleInviteSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Collaborators</h2>
        {isOwner && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Invite Collaborator
          </button>
        )}
      </div>

      <CollaboratorList projectId={projectId} isOwner={isOwner} onRefresh={refreshKey} />

      <InviteCollaboratorModal
        projectId={projectId}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />
    </div>
  )
}
