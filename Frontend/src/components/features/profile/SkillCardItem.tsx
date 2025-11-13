'use client'

import { SkillCard, ProficiencyLevel } from '@/types/user'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'

interface SkillCardItemProps {
  skill: SkillCard
  onEdit?: (skill: SkillCard) => void
  onDelete?: (skillId: string) => void
  editable?: boolean
}

const proficiencyColors: Record<ProficiencyLevel, string> = {
  [ProficiencyLevel.BEGINNER]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [ProficiencyLevel.INTERMEDIATE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [ProficiencyLevel.ADVANCED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  [ProficiencyLevel.EXPERT]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

export function SkillCardItem({ skill, onEdit, onDelete, editable = false }: SkillCardItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white">{skill.name}</h4>
        <div className="mt-2 flex items-center gap-2">
          <Badge className={proficiencyColors[skill.proficiencyLevel]}>
            {skill.proficiencyLevel}
          </Badge>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'}
          </span>
        </div>
      </div>
      
      {editable && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(skill)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => skill.id && onDelete?.(skill.id)}
            className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  )
}
