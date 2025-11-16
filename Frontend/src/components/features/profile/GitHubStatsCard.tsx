'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { Card } from '@/components/common/Card'
import { Spinner } from '@/components/common/Spinner'

interface GitHubStatsCardProps {
  userId: string
}

interface ActivitySummary {
  totalCommits: number
  totalRepositories: number
  averageCommitsPerRepo: number
  mostActiveRepository?: {
    name: string
    commitCount: number
    url: string
  }
}

interface LanguageStatistics {
  userId: string
  languages: Record<string, number>
}

const languageColors: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Swift: '#ffac45',
  Kotlin: '#F18E33',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
}

export function GitHubStatsCard({ userId }: GitHubStatsCardProps) {
  const { data: activityData, isLoading: activityLoading, isError: activityError } = useQuery({
    queryKey: ['github-activity', userId],
    queryFn: async () => {
      const response = await apiClient.get<ActivitySummary>(`/github/activity/summary`, {
        headers: { 'X-User-Id': userId }
      })
      return response
    },
    retry: false,
  })

  const { data: languageData, isLoading: languageLoading, isError: languageError } = useQuery({
    queryKey: ['github-languages', userId],
    queryFn: async () => {
      const response = await apiClient.get<LanguageStatistics>(`/github/stats/${userId}`)
      return response
    },
    retry: false,
  })

  const isLoading = activityLoading || languageLoading
  const hasError = activityError && languageError
  const hasData = activityData || (languageData && Object.keys(languageData.languages || {}).length > 0)

  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      </Card>
    )
  }

  if (hasError || !hasData) {
    return null
  }

  const languages = languageData?.languages ? Object.entries(languageData.languages) : []
  const totalBytes = languages.reduce((sum, [, bytes]) => sum + bytes, 0)
  const sortedLanguages = languages.sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">GitHub Statistics</h2>

      <div className="space-y-6">
        {/* Activity Summary */}
        {activityData && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contributions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {activityData.totalCommits.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total Commits
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {activityData.totalRepositories}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Repositories
                </div>
              </div>
            </div>

            {activityData.mostActiveRepository && (
              <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Most Active Repository
                </div>
                <a
                  href={activityData.mostActiveRepository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {activityData.mostActiveRepository.name}
                </a>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {activityData.mostActiveRepository.commitCount.toLocaleString()} commits
                </div>
              </div>
            )}
          </div>
        )}

        {/* Language Statistics */}
        {sortedLanguages.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Languages</h3>
            <div className="space-y-3">
              {sortedLanguages.map(([language, bytes]) => {
                const percentage = ((bytes / totalBytes) * 100).toFixed(1)
                const color = languageColors[language] || '#8b949e'

                return (
                  <div key={language}>
                    <div className="flex justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">{language}</span>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
