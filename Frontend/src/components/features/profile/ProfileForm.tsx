'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UpdateUserProfileRequest, Visibility } from '@/types/user'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

// Helper function to validate and normalize URLs
const urlSchema = z.string().transform((val) => {
  if (!val || val === '') return ''
  // Add https:// if no protocol is specified
  if (!val.startsWith('http://') && !val.startsWith('https://')) {
    return `https://${val}`
  }
  return val
}).pipe(z.string().url('Invalid URL').or(z.literal('')))

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must not exceed 30 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores').optional(),
  displayName: z.string().min(1, 'Display name is required').max(100),
  bio: z.string().optional(),
  location: z.string().max(200).optional(),
  website: urlSchema.optional(),
  visibility: z.nativeEnum(Visibility),
  github: urlSchema.optional(),
  linkedin: urlSchema.optional(),
  twitter: urlSchema.optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  defaultValues?: Partial<ProfileFormData>
  onSubmit: (data: UpdateUserProfileRequest) => void
  isSubmitting?: boolean
}

export function ProfileForm({ defaultValues, onSubmit, isSubmitting = false }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: defaultValues?.username || '',
      displayName: defaultValues?.displayName || '',
      bio: defaultValues?.bio || '',
      location: defaultValues?.location || '',
      website: defaultValues?.website || '',
      visibility: defaultValues?.visibility || Visibility.PUBLIC,
      github: defaultValues?.github || '',
      linkedin: defaultValues?.linkedin || '',
      twitter: defaultValues?.twitter || '',
    },
  })

  const handleFormSubmit = (data: ProfileFormData) => {
    const { github, linkedin, twitter, ...rest } = data
    
    const socialLinks: Record<string, string> = {}
    if (github) socialLinks.github = github
    if (linkedin) socialLinks.linkedin = linkedin
    if (twitter) socialLinks.twitter = twitter

    onSubmit({
      ...rest,
      socialLinks,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Username
        </label>
        <Input
          id="username"
          {...register('username')}
          placeholder="your_username"
          error={errors.username?.message}
        />
        <p className="mt-1 text-xs text-gray-500">3-30 characters, letters, numbers, and underscores only</p>
      </div>

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
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Bio
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location
          </label>
          <Input
            id="location"
            {...register('location')}
            placeholder="City, Country"
            error={errors.location?.message}
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Website
          </label>
          <Input
            id="website"
            {...register('website')}
            placeholder="https://example.com"
            error={errors.website?.message}
          />
        </div>
      </div>

      <div>
        <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Profile Visibility
        </label>
        <select
          id="visibility"
          {...register('visibility')}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value={Visibility.PUBLIC}>Public - Visible to everyone</option>
          <option value={Visibility.PRIVATE}>Private - Only visible to you</option>
        </select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Social Links</h3>
        
        <div>
          <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            GitHub
          </label>
          <Input
            id="github"
            {...register('github')}
            placeholder="https://github.com/username"
            error={errors.github?.message}
          />
        </div>

        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            LinkedIn
          </label>
          <Input
            id="linkedin"
            {...register('linkedin')}
            placeholder="https://linkedin.com/in/username"
            error={errors.linkedin?.message}
          />
        </div>

        <div>
          <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Twitter
          </label>
          <Input
            id="twitter"
            {...register('twitter')}
            placeholder="https://twitter.com/username"
            error={errors.twitter?.message}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  )
}
