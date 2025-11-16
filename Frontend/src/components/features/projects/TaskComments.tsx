'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { Button } from '@/components/common/Button'
import { useToast } from '@/contexts/ToastContext'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

interface TaskComment {
  id: string
  taskId: string
  userId: string
  username: string
  displayName: string
  content: string
  createdAt: string
  updatedAt: string
}

interface TaskCommentsProps {
  taskId: string
  currentUserId: string
  projectId: string
}

interface Collaborator {
  inviteeId: string
  inviteeUsername: string
  inviteeDisplayName: string
}

export function TaskComments({ taskId, currentUserId, projectId }: TaskCommentsProps) {
  const [comment, setComment] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const { data: collaborators = [] } = useQuery({
    queryKey: ['project-collaborators', projectId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Collaborator[] }>(`/collaborations/projects/${projectId}/enriched`)
      return Array.isArray(response.data) ? response.data : []
    },
  })

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: async () => {
      const response = await apiClient.get<TaskComment[]>(`/tasks/${taskId}/comments`)
      return response
    },
  })

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiClient.post(`/tasks/${taskId}/comments`, { content })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] })
      setComment('')
      showToast('Comment added', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message, 'error')
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] })
      showToast('Comment deleted', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message, 'error')
    },
  })

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart
    setComment(value)
    setCursorPosition(cursorPos)

    // Check for @ mention
    const textBeforeCursor = value.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt)
        setShowMentions(true)
        return
      }
    }
    setShowMentions(false)
  }

  const handleMentionSelect = (username: string) => {
    const textBeforeCursor = comment.substring(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    const textAfterCursor = comment.substring(cursorPosition)
    
    const newComment = comment.substring(0, lastAtIndex) + '@' + username + ' ' + textAfterCursor
    setComment(newComment)
    setShowMentions(false)
    textareaRef.current?.focus()
  }

  const filteredCollaborators = collaborators.filter(c => 
    c.inviteeUsername.toLowerCase().includes(mentionSearch.toLowerCase()) ||
    c.inviteeDisplayName?.toLowerCase().includes(mentionSearch.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (comment.trim()) {
      addCommentMutation.mutate(comment)
    }
  }

  const handleDelete = (commentId: string) => {
    setDeleteCommentId(commentId)
  }

  const confirmDelete = () => {
    if (deleteCommentId) {
      deleteCommentMutation.mutate(deleteCommentId)
      setDeleteCommentId(null)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comments</h3>

      <form onSubmit={handleSubmit} className="space-y-2 relative">
        <textarea
          ref={textareaRef}
          value={comment}
          onChange={handleCommentChange}
          placeholder="Add a comment... Type @ to mention collaborators"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        {showMentions && filteredCollaborators.length > 0 && (
          <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {filteredCollaborators.map((collab) => (
              <button
                key={collab.inviteeId}
                type="button"
                onClick={() => handleMentionSelect(collab.inviteeUsername)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  @{collab.inviteeUsername}
                </span>
                {collab.inviteeDisplayName && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {collab.inviteeDisplayName}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={!comment.trim() || addCommentMutation.isPending}
          >
            {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
          </Button>
        </div>
      </form>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {c.displayName || c.username}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                {c.userId === currentUserId && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteCommentId !== null}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={confirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  )
}
