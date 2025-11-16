'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

interface UserGitHubStatsProps {
  userId: string
}

interface ActivitySummary {
  totalCommits: number
  totalRepositories: number
}

interface LanguageStatistics {
  languages: Record<string, number>
}

export function UserGitHubStats({ userId }: UserGitHubStatsProps) {
  const { data: activityData, isError: activityError } = useQuery({
    queryKey: ['github-activity', userId],
    queryFn: async () => {
      const response = await apiClient.get<ActivitySummary>(`/github/activity/summary`, {
        headers: { 'X-User-Id': userId }
      })
      return response
    },
    retry: false,
  })

  const { data: languageData, isError: languageError } = useQuery({
    queryKey: ['github-languages', userId],
    queryFn: async () => {
      const response = await apiClient.get<LanguageStatistics>(`/github/stats/${userId}`)
      return response
    },
    retry: false,
  })

  const languages = languageData?.languages ? Object.entries(languageData.languages) : []
  const topLanguages = languages
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang)

  if ((activityError && languageError) || (!activityData && topLanguages.length === 0)) {
    return null
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        {activityData && (
          <>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              <span className="font-medium">{activityData.totalCommits.toLocaleString()}</span>
              <span>commits</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="font-medium">{activityData.totalRepositories}</span>
              <span>repos</span>
            </div>
          </>
        )}
      </div>
      {topLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {topLanguages.map((lang) => (
            <span
              key={lang}
              className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded"
            >
              {lang}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
