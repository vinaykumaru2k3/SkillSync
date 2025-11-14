'use client';

import { useQuery } from '@tanstack/react-query';
import { githubService } from '@/lib/api/services';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';

interface GitHubLanguageStatsProps {
  userId: string;
}

export function GitHubLanguageStats({ userId }: GitHubLanguageStatsProps) {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['github-language-stats', userId],
    queryFn: async () => {
      console.log('[GitHubLanguageStats] Fetching language statistics...');
      const result = await githubService.getLanguageStatistics();
      console.log('[GitHubLanguageStats] Received data:', result);
      return result;
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center">
          <Spinner />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Language Statistics</h3>
        <p className="text-red-600 dark:text-red-400 text-center">
          Error loading language statistics: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </Card>
    );
  }

  if (!stats || !stats.languages || Object.keys(stats.languages).length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Language Statistics</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          No language data available. Sync your repositories to see statistics.
        </p>
      </Card>
    );
  }

  const languages = Object.entries(stats.languages);
  const totalBytes = languages.reduce((sum, [, bytes]) => sum + bytes, 0);

  // Sort by bytes descending
  const sortedLanguages = languages.sort((a, b) => b[1] - a[1]);

  // Language colors (common GitHub language colors)
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
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Language Statistics</h3>
      
      {/* Language bars */}
      <div className="space-y-3">
        {sortedLanguages.map(([language, bytes]) => {
          const percentage = ((bytes / totalBytes) * 100).toFixed(1);
          const color = languageColors[language] || '#8b949e';
          
          return (
            <div key={language}>
              <div className="flex justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  ></span>
                  <span className="font-medium">{language}</span>
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
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total: {sortedLanguages.length} language{sortedLanguages.length !== 1 ? 's' : ''}
        </p>
      </div>
    </Card>
  );
}
