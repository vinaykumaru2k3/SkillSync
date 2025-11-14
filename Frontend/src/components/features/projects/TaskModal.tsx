'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/common/Modal'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { Task, TaskRequest, TaskPriority, TaskStatus } from '@/types/project'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TaskRequest) => Promise<void>
  onDelete?: () => Promise<void>
  task?: Task
  columnId: string
}

export function TaskModal({ isOpen, onClose, onSubmit, onDelete, task, columnId }: TaskModalProps) {
  const [formData, setFormData] = useState<TaskRequest>({
    title: '',
    description: '',
    assigneeId: undefined,
    labels: [],
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    dueDate: undefined,
    columnId: columnId,
  })
  const [labelInput, setLabelInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        assigneeId: task.assigneeId,
        labels: task.labels,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        columnId: task.columnId,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        assigneeId: undefined,
        labels: [],
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        dueDate: undefined,
        columnId: columnId,
      })
    }
  }, [task, columnId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Task title is required')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    
    if (confirm('Are you sure you want to delete this task?')) {
      setIsSubmitting(true)
      try {
        await onDelete()
        handleClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete task')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      assigneeId: undefined,
      labels: [],
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: undefined,
      columnId: columnId,
    })
    setLabelInput('')
    setError('')
    onClose()
  }

  const handleAddLabel = () => {
    if (labelInput.trim() && !formData.labels?.includes(labelInput.trim())) {
      setFormData({
        ...formData,
        labels: [...(formData.labels || []), labelInput.trim()],
      })
      setLabelInput('')
    }
  }

  const handleRemoveLabel = (label: string) => {
    setFormData({
      ...formData,
      labels: formData.labels?.filter((l) => l !== label) || [],
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={task ? 'Edit Task' : 'Create Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter task title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter task description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value as TaskPriority })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.HIGH}>High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as TaskStatus })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={TaskStatus.TODO}>To Do</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.DONE}>Done</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Due Date
          </label>
          <Input
            type="date"
            value={formData.dueDate || ''}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value || undefined })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Labels
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
              placeholder="Add label..."
            />
            <Button type="button" onClick={handleAddLabel} size="sm">
              Add
            </Button>
          </div>
          {formData.labels && formData.labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.labels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(label)}
                    className="hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 pt-4">
          <div>
            {task && onDelete && (
              <Button
                type="button"
                onClick={handleDelete}
                variant="secondary"
                disabled={isSubmitting}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" onClick={handleClose} variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
