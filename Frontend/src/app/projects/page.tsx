'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '@/lib/api/services'
import { ProjectList, ProjectFilters, CreateProjectModal } from '@/components/features/projects'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { Navigation } from '@/components/common/Navigation'
import { ProjectRequest } from '@/types/project'
import { useAuthGuard } from '@/hooks/useAuthGuard'

export default function ProjectsPage() {
  useAuthGuard()
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    tags: [] as string[],
    technologies: [] as string[],
  })
  
  const queryClient = useQueryClient()

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', searchParams],
    queryFn: () => {
      if (searchParams.searchTerm || searchParams.tags.length > 0 || searchParams.technologies.length > 0) {
        return projectService.searchProjects(searchParams)
      }
      return projectService.discoverProjects()
    },
  })

  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectRequest) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setIsCreateModalOpen(false)
    },
  })

  const handleSearch = (searchTerm: string, tags: string[], technologies: string[]) => {
    // Only search if there's actual content or filters
    setSearchParams({ 
      searchTerm: searchTerm.trim(), 
      tags, 
      technologies 
    })
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded">
            Error loading projects: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Project
          </Button>
        </div>

        <ProjectFilters 
          onSearch={handleSearch}
          currentSearchTerm={searchParams.searchTerm}
          currentTags={searchParams.tags}
          currentTechnologies={searchParams.technologies}
        />

        <ProjectList
          projects={projects || []}
          emptyMessage="No projects found. Create your first project to get started!"
        />

        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(data) => createProjectMutation.mutateAsync(data)}
        />
      </div>
    </div>
  )
}
