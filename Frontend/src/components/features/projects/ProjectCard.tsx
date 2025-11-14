'use client'

import Link from 'next/link'
import { Project } from '@/types/project'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {project.name}
            </h3>
            <Badge variant={project.visibility === 'PUBLIC' ? 'success' : 'secondary'}>
              {project.visibility}
            </Badge>
          </div>
          
          {project.description && (
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
              {project.description}
            </p>
          )}
          
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.slice(0, 5).map((tech) => (
                <Badge key={tech} variant="primary" size="sm">
                  {tech}
                </Badge>
              ))}
              {project.technologies.length > 5 && (
                <Badge variant="secondary" size="sm">
                  +{project.technologies.length - 5}
                </Badge>
              )}
            </div>
          )}
          
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>
              {project.columns.reduce((acc, col) => acc + col.tasks.length, 0)} tasks
            </span>
            <span>
              {new Date(project.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
