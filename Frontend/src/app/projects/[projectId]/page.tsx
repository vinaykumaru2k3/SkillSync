'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '@/lib/api/services'
import { Spinner } from '@/components/common/Spinner'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Navigation, Breadcrumb } from '@/components/common'
import { KanbanBoard, TaskModal, EditProjectModal, DeleteProjectModal } from '@/components/features/projects'
import { CollaboratorList, InviteCollaboratorModal } from '@/components/features/collaboration'
import { ProjectFeedback } from '@/components/features/feedback'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useProjectPermissions } from '@/hooks/useProjectPermissions'
import { Task, TaskRequest, ProjectRequest } from '@/types/project'
import { useToast } from '@/contexts/ToastContext'
import { getTechIcon } from '@/lib/utils/techIcons'

export default function ProjectDetailPage() {
  useAuthGuard()
  
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const queryClient = useQueryClient()

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()
  const [selectedColumnId, setSelectedColumnId] = useState<string>('')

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProject(projectId),
    enabled: !!projectId,
  })

  const { permissions, isLoading: permissionsLoading } = useProjectPermissions(projectId)
  const { showToast } = useToast()

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskRequest) => projectService.createTask(data),
    onSuccess: async () => {
      // Wait for the query to refetch before closing modal
      await queryClient.refetchQueries({ queryKey: ['project', projectId] })
      setIsTaskModalOpen(false)
      setSelectedTask(undefined)
      setSelectedColumnId('')
    },
    onError: (error) => {
      console.error('Failed to create task:', error)
      showToast('Failed to create task. Please try again.', 'error')
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskRequest }) =>
      projectService.updateTask(taskId, data),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['project', projectId] })
      setIsTaskModalOpen(false)
      setSelectedTask(undefined)
      setSelectedColumnId('')
    },
    onError: (error) => {
      console.error('Failed to update task:', error)
      showToast('Failed to update task. Please try again.', 'error')
    },
  })

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, targetColumnId, position }: { taskId: string; targetColumnId: string; position: number }) =>
      projectService.moveTask(taskId, { targetColumnId, position }),
    onMutate: async ({ taskId, targetColumnId, position }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['project', projectId] })

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(['project', projectId])

      // Optimistically update the UI
      queryClient.setQueryData(['project', projectId], (old: any) => {
        if (!old) return old

        const newColumns = old.columns.map((column: any) => {
          // Remove task from source column
          const tasksWithoutMoved = column.tasks.filter((task: any) => task.id !== taskId)
          
          // If this is the target column, add the task at the new position
          if (column.id === targetColumnId) {
            const movedTask = old.columns
              .flatMap((col: any) => col.tasks)
              .find((task: any) => task.id === taskId)
            
            if (movedTask) {
              const updatedTask = { ...movedTask, columnId: targetColumnId, position }
              tasksWithoutMoved.splice(position, 0, updatedTask)
            }
          }

          return {
            ...column,
            tasks: tasksWithoutMoved.map((task: any, index: number) => ({
              ...task,
              position: index,
            })),
          }
        })

        return { ...old, columns: newColumns }
      })

      return { previousProject }
    },
    onError: (error, variables, context) => {
      console.error('Failed to move task:', error)
      showToast('Failed to move task. Please try again.', 'error')
      // Rollback to previous state and refetch
      if (context?.previousProject) {
        queryClient.setQueryData(['project', projectId], context.previousProject)
      }
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
    },
    // Don't refetch on success - trust the optimistic update
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => projectService.deleteTask(taskId),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['project', projectId] })
      setIsTaskModalOpen(false)
      setSelectedTask(undefined)
      setSelectedColumnId('')
    },
    onError: (error) => {
      console.error('Failed to delete task:', error)
      showToast('Failed to delete task. Please try again.', 'error')
    },
  })

  const updateProjectMutation = useMutation({
    mutationFn: (data: ProjectRequest) => projectService.updateProject(projectId, data),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['project', projectId] })
      setIsEditModalOpen(false)
    },
    onError: (error) => {
      console.error('Failed to update project:', error)
      showToast('Failed to update project. Please try again.', 'error')
    },
  })

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectService.deleteProject(projectId),
    onSuccess: () => {
      router.push('/projects')
    },
    onError: (error) => {
      console.error('Failed to delete project:', error)
      showToast('Failed to delete project. Please try again.', 'error')
    },
  })

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setSelectedColumnId(task.columnId)
    setIsTaskModalOpen(true)
  }

  const handleAddTask = (columnId: string) => {
    if (!permissions.canWrite) return
    setSelectedTask(undefined)
    setSelectedColumnId(columnId)
    setIsTaskModalOpen(true)
  }

  const handleTaskSubmit = async (data: TaskRequest) => {
    if (selectedTask) {
      await updateTaskMutation.mutateAsync({ taskId: selectedTask.id, data })
    } else {
      await createTaskMutation.mutateAsync(data)
    }
  }

  const handleTaskDelete = async () => {
    if (selectedTask) {
      await deleteTaskMutation.mutateAsync(selectedTask.id)
    }
  }

  const handleTaskMove = (taskId: string, targetColumnId: string, position: number) => {
    if (!permissions.canWrite) return
    
    // Verify the task exists in the current project data
    const taskExists = project?.columns.some(col => 
      col.tasks.some(task => task.id === taskId)
    )
    
    if (!taskExists) {
      console.error('Task not found in current project data:', taskId)
      showToast('Task not found. Please refresh the page.', 'error')
      return
    }
    
    console.log('Moving task:', { taskId, targetColumnId, position })
    moveTaskMutation.mutate({ taskId, targetColumnId, position })
  }

  const handleUpdateProject = async (data: ProjectRequest) => {
    await updateProjectMutation.mutateAsync(data)
  }

  const handleDeleteProject = () => {
    deleteProjectMutation.mutate()
    setIsDeleteModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="flex justify-center items-center min-h-screen">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded">
            Error loading project: {error instanceof Error ? error.message : 'Project not found'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="w-full px-4 py-8 max-w-[1920px] mx-auto">
        <Breadcrumb
          items={[
            { label: 'Projects', href: '/projects' },
            { label: project.name },
          ]}
        />
        
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-300">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={project.visibility === 'PUBLIC' ? 'success' : 'secondary'}>
              {project.visibility}
            </Badge>
            {permissions.canWrite && (
              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="secondary"
                size="sm"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </Button>
            )}
            {permissions.canWrite && (
              <Button
                onClick={() => setIsInviteModalOpen(true)}
                variant="primary"
                size="sm"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Invite
              </Button>
            )}
            {permissions.canDelete && (
              <Button
                onClick={() => setIsDeleteModalOpen(true)}
                variant="secondary"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </Button>
            )}
          </div>
        </div>

        {project.repositoryUrl && (
          <div className="mb-4">
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View Repository →
            </a>
          </div>
        )}

        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="primary">
                  <span className="mr-1">{getTechIcon(tech)}</span>
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {project.tags && project.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Collaborators</h2>
        <CollaboratorList projectId={projectId} isOwner={permissions.canDelete} ownerId={project.ownerId} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Feedback & Reviews</h2>
        <ProjectFeedback projectId={projectId} isOwner={permissions.canDelete} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-x-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Project Board</h2>
        {project.columns && project.columns.length > 0 ? (
          <div className="min-w-max">
            <KanbanBoard
              columns={project.columns}
              onTaskMove={handleTaskMove}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
              permissions={permissions}
            />
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No board columns available</p>
        )}
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        onDelete={selectedTask ? handleTaskDelete : undefined}
        task={selectedTask}
        columnId={selectedColumnId}
        projectId={projectId}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProject}
        project={project}
      />

      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProject}
        projectName={project.name}
        isDeleting={deleteProjectMutation.isPending}
      />

      <InviteCollaboratorModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={projectId}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['project', projectId] })}
      />
      </div>
    </div>
  )
}
