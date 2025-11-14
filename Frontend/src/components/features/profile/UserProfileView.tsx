'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userService } from '@/lib/api/services/userService'
import { SkillCard, UpdateUserProfileRequest } from '@/types/user'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { Spinner } from '@/components/common/Spinner'
import { ProfileForm } from './ProfileForm'
import { ProfileImageUpload } from './ProfileImageUpload'
import { SkillCardItem } from './SkillCardItem'
import { SkillCardForm } from './SkillCardForm'
import { useToast } from '@/hooks/useToast'

interface UserProfileViewProps {
  userId: string
  editable?: boolean
}

export function UserProfileView({ userId, editable = false }: UserProfileViewProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [editingSkill, setEditingSkill] = useState<SkillCard | null>(null)
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => userService.getProfileByUserId(userId),
  })

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateUserProfileRequest) =>
      userService.updateProfile(profile!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
      setIsEditingProfile(false)
      showToast('Profile updated successfully', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message, 'error')
    },
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: (imageUrl: string) => 
      userService.updateProfile(profile!.id, { profileImageUrl: imageUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
      showToast('Profile image updated successfully', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message, 'error')
    },
  })

  const addSkillMutation = useMutation({
    mutationFn: (skill: SkillCard) => userService.addSkill(profile!.id, skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
      setIsAddingSkill(false)
      showToast('Skill added successfully', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message, 'error')
    },
  })

  const updateSkillMutation = useMutation({
    mutationFn: ({ skillId, skill }: { skillId: string; skill: SkillCard }) =>
      userService.updateSkill(profile!.id, skillId, skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
      setEditingSkill(null)
      showToast('Skill updated successfully', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message, 'error')
    },
  })

  const deleteSkillMutation = useMutation({
    mutationFn: (skillId: string) => userService.deleteSkill(profile!.id, skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
      showToast('Skill deleted successfully', 'success')
    },
    onError: (error: Error) => {
      showToast(error.message, 'error')
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!profile) {
    return (
      <Card>
        <p className="text-center text-gray-600 dark:text-gray-400">Profile not found</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          {editable ? (
            <ProfileImageUpload
              currentImageUrl={profile.profileImageUrl}
              onUpload={(imageUrl) => uploadAvatarMutation.mutateAsync(imageUrl)}
            />
          ) : (
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
              {profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt={profile.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <svg className="h-16 w-16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.displayName}
                </h1>
                {/* Visibility Badge */}
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                    profile.visibility === 'PUBLIC'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                  title={profile.visibility === 'PUBLIC' ? 'Public Profile' : 'Private Profile'}
                >
                  {profile.visibility === 'PUBLIC' ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                  <span>{profile.visibility === 'PUBLIC' ? 'Public' : 'Private'}</span>
                </div>
              </div>
              {editable && (
                <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            {profile.location && (
              <div className="mt-2 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{profile.location}</span>
              </div>
            )}

            {profile.bio && (
              <p className="mt-4 text-gray-700 dark:text-gray-300">{profile.bio}</p>
            )}

            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-600 hover:underline dark:text-blue-400"
              >
                {profile.website}
              </a>
            )}

            {Object.keys(profile.socialLinks).length > 0 && (
              <div className="mt-4 flex gap-3">
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                    title="GitHub"
                  >
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                )}
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors"
                    title="LinkedIn"
                  >
                    <svg className="w-5 h-5 text-blue-700 dark:text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {profile.socialLinks.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 dark:bg-sky-900 dark:hover:bg-sky-800 transition-colors"
                    title="Twitter"
                  >
                    <svg className="w-5 h-5 text-sky-700 dark:text-sky-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Skills Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Skills</h2>
          {editable && (
            <Button onClick={() => setIsAddingSkill(true)}>Add Skill</Button>
          )}
        </div>

        {profile.skills.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">No skills added yet</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {profile.skills.map((skill) => (
              <SkillCardItem
                key={skill.id}
                skill={skill}
                editable={editable}
                onEdit={setEditingSkill}
                onDelete={(skillId) => deleteSkillMutation.mutate(skillId)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        title="Edit Profile"
      >
        <ProfileForm
          defaultValues={{
            displayName: profile.displayName,
            bio: profile.bio,
            location: profile.location,
            website: profile.website,
            visibility: profile.visibility,
            github: profile.socialLinks.github,
            linkedin: profile.socialLinks.linkedin,
            twitter: profile.socialLinks.twitter,
          }}
          onSubmit={(data) => updateProfileMutation.mutate(data)}
          isSubmitting={updateProfileMutation.isPending}
        />
      </Modal>

      {/* Add Skill Modal */}
      <Modal
        isOpen={isAddingSkill}
        onClose={() => setIsAddingSkill(false)}
        title="Add Skill"
      >
        <SkillCardForm
          onSubmit={(skill) => addSkillMutation.mutate(skill)}
          onCancel={() => setIsAddingSkill(false)}
        />
      </Modal>

      {/* Edit Skill Modal */}
      <Modal
        isOpen={!!editingSkill}
        onClose={() => setEditingSkill(null)}
        title="Edit Skill"
      >
        {editingSkill && (
          <SkillCardForm
            skill={editingSkill}
            onSubmit={(skill) =>
              updateSkillMutation.mutate({ skillId: editingSkill.id!, skill })
            }
            onCancel={() => setEditingSkill(null)}
          />
        )}
      </Modal>
    </div>
  )
}
