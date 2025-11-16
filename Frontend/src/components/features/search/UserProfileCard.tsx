'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserProfile } from '@/types/user'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { InviteCollaboratorModal } from '@/components/features/collaboration'
import { useQuery } from '@tanstack/react-query'
import { projectService } from '@/lib/api/services'
import { useToast } from '@/contexts/ToastContext'

interface UserProfileCardProps {
  profile: UserProfile
}

export function UserProfileCard({ profile }: UserProfileCardProps) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [showProjectMenu, setShowProjectMenu] = useState(false)
  const { showToast } = useToast()

  // Fetch user's projects for the invite dropdown
  const { data: projectsData, error: projectsError, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getMyProjects(),
    retry: false,
    throwOnError: false,
  })

  // Combine owned and collaborated projects
  const projects = projectsData ? [...projectsData.owned, ...projectsData.collaborated] : []

  const handleInviteClick = (e: React.MouseEvent, projectId: string) => {
    try {
      e.preventDefault()
      e.stopPropagation()
      if (!projectId) throw new Error('Invalid project ID')
      setSelectedProjectId(projectId)
      setIsInviteModalOpen(true)
      setShowProjectMenu(false)
    } catch (error) {
      console.error('Error handling invite click:', error)
    }
  }

  const toggleProjectMenu = (e: React.MouseEvent) => {
    try {
      e.preventDefault()
      e.stopPropagation()
      setShowProjectMenu(!showProjectMenu)
    } catch (error) {
      console.error('Error toggling project menu:', error)
    }
  }

  return (
    <>
      <Card className="h-full transition-shadow hover:shadow-lg relative">
        <Link href={`/profile/${profile.userId}`} className="block">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
              {profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt={profile.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {profile.displayName || 'Unknown User'}
              </h3>
              
              {profile.username && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{profile.username}
                </p>
              )}
              
              {profile.location && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {profile.location}
                </p>
              )}

            {profile.bio && (
              <p className="mt-2 line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
                {profile.bio}
              </p>
            )}

            {profile.skills?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.skills.slice(0, 5).map((skill) => (
                  <Badge
                    key={skill.id || skill.name}
                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {skill.name || 'Unknown Skill'}
                  </Badge>
                ))}
                {profile.skills.length > 5 && (
                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    +{profile.skills.length - 5} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        </Link>

        {/* Invite Button */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 relative">
          <Button
            variant="primary"
            size="sm"
            onClick={toggleProjectMenu}
            className="w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Invite to Project
          </Button>

          {/* Project Selection Dropdown */}
          {showProjectMenu && projects.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {projects.map((project) => (
                <button
                  key={project.id || project.name}
                  onClick={(e) => handleInviteClick(e, project.id)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white"
                >
                  {project.name || 'Unnamed Project'}
                </button>
              ))}
            </div>
          )}

          {showProjectMenu && isError && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-lg shadow-lg p-4 z-10">
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to load projects. Please try again.
              </p>
            </div>
          )}

          {showProjectMenu && !isError && projects.length === 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-10">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You don't have any projects yet. Create a project first to invite collaborators.
              </p>
            </div>
          )}
        </div>
      </Card>

      {selectedProjectId && (
        <InviteCollaboratorModal
          projectId={selectedProjectId}
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false)
            setSelectedProjectId(null)
          }}
          onSuccess={() => {
            showToast(`Invitation sent to @${profile.username}!`, 'success')
          }}
          preSelectedUser={{
            userId: profile.userId,
            username: profile.username || '',
            displayName: profile.displayName || 'Unknown User'
          }}
        />
      )}
    </>
  )
}
