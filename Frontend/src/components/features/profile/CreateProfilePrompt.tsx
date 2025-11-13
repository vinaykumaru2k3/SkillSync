'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Visibility } from '@/types/user'

const createProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(100),
  bio: z.string().optional(),
  location: z.string().max(200).optional(),
})

type CreateProfileFormData = z.infer<typeof createProfileSchema>

interface CreateProfilePromptProps {
  userId: string
  onSubmit: (data: CreateProfileFormData) => void
  isSubmitting?: boolean
}

export function CreateProfilePrompt({ userId, onSubmit, isSubmitting = false }: CreateProfilePromptProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProfileFormData>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      displayName: '',
      bio: '',
      location: '',
    },
  })

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <svg className="h-8 w-8 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Your Profile
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Let's set up your profile to get started with SkillSync
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Display Name *
            </label>
            <Input
              id="displayName"
              {...register('displayName')}
              placeholder="Your name"
              error={errors.displayName?.message}
            />
            <p className="mt-1 text-xs text-gray-500">This is how other developers will see you</p>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              {...register('bio')}
              rows={4}
              placeholder="Tell us about yourself..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Location (Optional)
            </label>
            <Input
              id="location"
              {...register('location')}
              placeholder="City, Country"
              error={errors.location?.message}
            />
          </div>

          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You can add more details like skills, profile picture, and social links after creating your profile.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
