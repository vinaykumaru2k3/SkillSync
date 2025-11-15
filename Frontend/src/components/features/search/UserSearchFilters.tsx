'use client'

import { useState } from 'react'
import { ProficiencyLevel } from '@/types/user'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'

interface SearchFilters {
  query: string
  skills: string[]
  minProficiencyLevel?: ProficiencyLevel
  location: string
}

interface UserSearchFiltersProps {
  onSearch: (filters: SearchFilters) => void
}

export function UserSearchFilters({ onSearch }: UserSearchFiltersProps) {
  const [query, setQuery] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [minProficiencyLevel, setMinProficiencyLevel] = useState<ProficiencyLevel | undefined>()
  const [location, setLocation] = useState('')

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleSearch = () => {
    onSearch({
      query,
      skills,
      minProficiencyLevel,
      location,
    })
  }

  const handleClear = () => {
    setQuery('')
    setSkills([])
    setMinProficiencyLevel(undefined)
    setLocation('')
    onSearch({
      query: '',
      skills: [],
      minProficiencyLevel: undefined,
      location: '',
    })
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Search Filters</h3>

      <div>
        <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Search Query
        </label>
        <Input
          id="query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username, name, or bio..."
        />
      </div>

      <div>
        <label htmlFor="skillInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Skills
        </label>
        <div className="flex gap-2">
          <Input
            id="skillInput"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            placeholder="Add skill..."
          />
          <Button type="button" onClick={handleAddSkill}>
            Add
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="minProficiencyLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Minimum Proficiency Level
        </label>
        <select
          id="minProficiencyLevel"
          value={minProficiencyLevel || ''}
          onChange={(e) => setMinProficiencyLevel(e.target.value as ProficiencyLevel || undefined)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Any Level</option>
          {Object.values(ProficiencyLevel).map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Location
        </label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, Country"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSearch} className="flex-1">
          Search
        </Button>
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </div>
  )
}
