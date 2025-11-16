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

  const { data: projectsData, isLoading, error } = useQuery({
    queryKey: ['projects', searchParams],
    queryFn: async () => {
      if (searchParams.searchTerm || searchParams.tags.length > 0 || searchParams.technologies.length > 0) {
        const results = await projectService.searchProjects(searchParams)
        return { owned: results, collaborated: [] }
      }
      return projectService.getMyProjects()
    },
    retry: false,
    throwOnError: false,
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

  const ownedProjects = projectsData?.owned || []
  const collaboratedProjects = projectsData?.collaborated || []
  const isSearching = searchParams.searchTerm || searchParams.tags.length > 0 || searchParams.technologies.length > 0

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

        {isSearching ? (
          <ProjectList
            projects={ownedProjects}
            emptyMessage="No projects found matching your search."
          />
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">My Projects</h2>
              <ProjectList
                projects={ownedProjects}
                emptyMessage="No projects yet. Create your first project to get started!"
              />
            </div>

            {collaboratedProjects.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Collaborated Projects</h2>
                <ProjectList
                  projects={collaboratedProjects}
                  emptyMessage=""
                />
              </div>
            )}
          </>
        )}

        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(data) => createProjectMutation.mutateAsync(data)}
        />
      </div>
    </div>
  )
}
