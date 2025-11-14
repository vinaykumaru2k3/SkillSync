'use client'

import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'

interface DeleteProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  projectName: string
  isDeleting: boolean
}

export function DeleteProjectModal({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  isDeleting,
}: DeleteProjectModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Project">
      <div className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                Warning: This action cannot be undone
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                Deleting this project will permanently remove all associated data, including tasks,
                board columns, and project settings.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900 dark:text-white">"{projectName}"</span>?
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button onClick={onClose} variant="secondary" disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
