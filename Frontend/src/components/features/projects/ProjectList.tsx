'use client'

import { Project } from '@/types/project'
import { ProjectCard } from './ProjectCard'

interface ProjectListProps {
  projects: Project[]
  emptyMessage?: string
}

export function ProjectList({ projects, emptyMessage = 'No projects found' }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
