'use client'

import { useState } from 'react'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'

interface ProjectFiltersProps {
  onSearch: (searchTerm: string, tags: string[], technologies: string[]) => void
  currentSearchTerm?: string
  currentTags?: string[]
  currentTechnologies?: string[]
}

export function ProjectFilters({ 
  onSearch, 
  currentSearchTerm = '',
  currentTags = [],
  currentTechnologies = []
}: ProjectFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(currentSearchTerm)
  const [tagInput, setTagInput] = useState('')
  const [techInput, setTechInput] = useState('')
  const [tags, setTags] = useState<string[]>(currentTags)
  const [technologies, setTechnologies] = useState<string[]>(currentTechnologies)

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()]
      setTags(newTags)
      setTagInput('')
      onSearch(searchTerm.trim(), newTags, technologies)
    }
  }

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag)
    setTags(newTags)
    onSearch(searchTerm.trim(), newTags, technologies)
  }

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      const newTechs = [...technologies, techInput.trim()]
      setTechnologies(newTechs)
      setTechInput('')
      onSearch(searchTerm.trim(), tags, newTechs)
    }
  }

  const handleRemoveTech = (tech: string) => {
    const newTechs = technologies.filter((t) => t !== tech)
    setTechnologies(newTechs)
    onSearch(searchTerm.trim(), tags, newTechs)
  }

  const handleSearchClick = () => {
    onSearch(searchTerm.trim(), tags, technologies)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchClick()
    }
  }

  const handleClearAll = () => {
    setSearchTerm('')
    setTags([])
    setTechnologies([])
    onSearch('', [], [])
  }

  const hasActiveFilters = currentSearchTerm || currentTags.length > 0 || currentTechnologies.length > 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleSearchKeyPress}
          />
          <Button onClick={handleSearchClick} size="sm">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Tags
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} size="sm">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-600 dark:hover:text-blue-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Technologies
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add technology..."
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTech()}
              />
              <Button onClick={handleAddTech} size="sm">
                Add
              </Button>
            </div>
            {technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {technologies.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                  >
                    {tech}
                    <button
                      onClick={() => handleRemoveTech(tech)}
                      className="hover:text-green-600 dark:hover:text-green-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active filters: {' '}
                {currentSearchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    Search: "{currentSearchTerm}"
                  </span>
                )}
                {currentSearchTerm && (currentTags.length > 0 || currentTechnologies.length > 0) && ' '}
                {currentTags.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                    {currentTags.length} tag{currentTags.length > 1 ? 's' : ''}
                  </span>
                )}
                {currentTags.length > 0 && currentTechnologies.length > 0 && ' '}
                {currentTechnologies.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 rounded text-xs">
                    {currentTechnologies.length} tech{currentTechnologies.length > 1 ? 's' : ''}
                  </span>
                )}
              </span>
            </div>
            <Button onClick={handleClearAll} variant="secondary" size="sm">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
