'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SkillCard, ProficiencyLevel } from '@/types/user'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  proficiencyLevel: z.nativeEnum(ProficiencyLevel),
  yearsOfExperience: z.number().min(0, 'Years must be non-negative'),
})

type SkillFormData = z.infer<typeof skillSchema>

interface SkillCardFormProps {
  skill?: SkillCard
  onSubmit: (data: SkillCard) => void
  onCancel: () => void
}

export function SkillCardForm({ skill, onSubmit, onCancel }: SkillCardFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: skill || {
      name: '',
      proficiencyLevel: ProficiencyLevel.BEGINNER,
      yearsOfExperience: 0,
    },
  })

  const handleFormSubmit = (data: SkillFormData) => {
    onSubmit({
      ...data,
      id: skill?.id,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Skill Name
        </label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., React, Java, Python"
          error={errors.name?.message}
        />
      </div>

      <div>
        <label htmlFor="proficiencyLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Proficiency Level
        </label>
        <select
          id="proficiencyLevel"
          {...register('proficiencyLevel')}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {Object.values(ProficiencyLevel).map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        {errors.proficiencyLevel && (
          <p className="mt-1 text-sm text-red-600">{errors.proficiencyLevel.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Years of Experience
        </label>
        <Input
          id="yearsOfExperience"
          type="number"
          {...register('yearsOfExperience', { valueAsNumber: true })}
          placeholder="0"
          error={errors.yearsOfExperience?.message}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : skill ? 'Update Skill' : 'Add Skill'}
        </Button>
      </div>
    </form>
  )
}
