'use client'

import { Task, TaskPriority } from '@/types/project'
import { Badge } from '@/components/common/Badge'

interface TaskCardProps {
  task: Task
  onClick: () => void
  canEdit?: boolean
}

export function TaskCard({ task, onClick, canEdit = true }: TaskCardProps) {
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'error'
      case TaskPriority.MEDIUM:
        return 'warning'
      case TaskPriority.LOW:
        return 'info'
      default:
        return 'secondary'
    }
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-600 ${
        !canEdit ? 'opacity-75' : ''
      }`}
      title={!canEdit ? 'Read-only access' : undefined}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
          {task.title}
        </h4>
        <Badge variant={getPriorityColor(task.priority)} size="sm">
          {task.priority}
        </Badge>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
            >
              {label}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {task.dueDate && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}

      {task.creatorUsername && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {task.creatorProfileImageUrl ? (
            <img
              src={task.creatorProfileImageUrl}
              alt={task.creatorUsername}
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
              {task.creatorUsername.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {task.creatorUsername}
          </span>
        </div>
      )}
    </div>
  )
}
