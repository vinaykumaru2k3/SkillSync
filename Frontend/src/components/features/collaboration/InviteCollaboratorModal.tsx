'use client'

import { useState } from 'react'
import { collaborationApi } from '@/lib/api/collaboration'
import { CollaborationRole } from '@/types/collaboration'

interface InviteCollaboratorModalProps {
  projectId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  preSelectedUser?: {
    userId: string
    username: string
    displayName: string
  }
}

export default function InviteCollaboratorModal({
  projectId,
  isOpen,
  onClose,
  onSuccess,
  preSelectedUser,
}: InviteCollaboratorModalProps) {
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<CollaborationRole>(CollaborationRole.VIEWER)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      let inviteeId: string
      
      if (preSelectedUser) {
        // Use pre-selected user
        inviteeId = preSelectedUser.userId
      } else {
        // Look up user by username
        const response = await fetch(`http://localhost:8080/api/v1/users/username/${username}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User not found')
          }
          if (response.status === 401) {
            throw new Error('Authentication failed')
          }
          if (response.status >= 500) {
            throw new Error('Server error. Please try again later')
          }
          throw new Error(`Failed to find user (${response.status})`)
        }
        
        const apiResponse = await response.json()
        const userProfile = apiResponse.data || apiResponse
        
        if (!userProfile?.userId) {
          throw new Error('Invalid user data received')
        }
        
        inviteeId = userProfile.userId
      }
      
      await collaborationApi.createInvitation({
        projectId,
        inviteeId,
        role,
      })

      setUsername('')
      setRole(CollaborationRole.VIEWER)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {preSelectedUser ? `Invite ${preSelectedUser.displayName}` : 'Invite Collaborator'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {preSelectedUser ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Inviting User
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="font-medium text-gray-900 dark:text-white">
                  {preSelectedUser.displayName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{preSelectedUser.username}
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter username (e.g., john_doe)"
                required
                pattern="[a-zA-Z0-9_]{3,30}"
                title="Username must be 3-30 characters and contain only letters, numbers, and underscores"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the username of the person you want to invite
              </p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as CollaborationRole)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={CollaborationRole.VIEWER}>Viewer (Read-only)</option>
              <option value={CollaborationRole.EDITOR}>Editor (Read & Write)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {role === CollaborationRole.VIEWER
                ? 'Can view project and tasks'
                : 'Can view, create, and edit tasks'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
