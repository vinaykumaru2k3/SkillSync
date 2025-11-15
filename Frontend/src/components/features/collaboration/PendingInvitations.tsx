'use client'

import { useEffect, useState } from 'react'
import { collaborationApi } from '@/lib/api/collaboration'
import { Collaboration, CollaborationRole } from '@/types/collaboration'

export default function PendingInvitations() {
  const [invitations, setInvitations] = useState<Collaboration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await collaborationApi.getPendingInvitations()
      setInvitations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (invitationId: string) => {
    try {
      setProcessingId(invitationId)
      await collaborationApi.acceptInvitation(invitationId)
      loadInvitations()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to accept invitation')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDecline = async (invitationId: string) => {
    try {
      setProcessingId(invitationId)
      await collaborationApi.declineInvitation(invitationId)
      loadInvitations()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to decline invitation')
    } finally {
      setProcessingId(null)
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

  if (invitations.length === 0) {
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No pending invitations</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Project Invitation
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(
                    invitation.role
                  )}`}
                >
                  {invitation.role}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                From: User {invitation.inviterId.substring(0, 8)}...
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Project ID: {invitation.projectId.substring(0, 8)}...
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Invited {new Date(invitation.invitedAt).toLocaleDateString()} • Expires{' '}
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleAccept(invitation.id)}
                disabled={processingId === invitation.id}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === invitation.id ? 'Processing...' : 'Accept'}
              </button>
              <button
                onClick={() => handleDecline(invitation.id)}
                disabled={processingId === invitation.id}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
