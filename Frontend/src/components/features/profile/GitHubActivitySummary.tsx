'use client';

import { useQuery } from '@tanstack/react-query';
import { githubService } from '@/lib/api/services';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';

export function GitHubActivitySummary() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['github-activity-summary'],
    queryFn: githubService.getActivitySummary,
    retry: false,
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

  if (!summary) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Commit Activity</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Total Commits */}
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {summary.totalCommits.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total Commits
          </div>
        </div>

        {/* Average Commits */}
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {summary.averageCommitsPerRepo}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Avg per Repo
          </div>
        </div>
      </div>

      {/* Most Active Repository */}
      {summary.mostActiveRepository && (
        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Most Active Repository
          </div>
          <a
            href={summary.mostActiveRepository.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            {summary.mostActiveRepository.name}
          </a>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {summary.mostActiveRepository.commitCount.toLocaleString()} commits
          </div>
        </div>
      )}
    </Card>
  );
}
