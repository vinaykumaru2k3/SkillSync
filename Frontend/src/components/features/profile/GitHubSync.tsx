'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { githubService } from '@/lib/api/services';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import type { GitHubRepository, SyncStatus } from '@/types/github';

export function GitHubSync() {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 6;

  // Fetch repositories
  const { data: repositories, isLoading: isLoadingRepos } = useQuery({
    queryKey: ['github-repositories'],
    queryFn: githubService.getRepositories,
    retry: false,
  });

  // Fetch sync status
  const { data: syncStatus } = useQuery({
    queryKey: ['github-sync-status'],
    queryFn: githubService.getSyncStatus,
    retry: false,
    refetchInterval: (data) => {
      // Poll every 3 seconds if sync is in progress
      return data?.status === 'IN_PROGRESS' ? 3000 : false;
    },
  });

  // Sync mutation
  const syncMutation = useMutation({
    mutationFn: githubService.syncRepositories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['github-repositories'] });
      queryClient.invalidateQueries({ queryKey: ['github-sync-status'] });
      setIsSyncing(false);
    },
    onError: (error) => {
      console.error('Sync failed:', error);
      setIsSyncing(false);
    },
  });

  const handleSync = () => {
    if (!githubToken) {
      setShowTokenInput(true);
      return;
    }
    setIsSyncing(true);
    syncMutation.mutate();
  };

  const handleTokenSubmit = () => {
    if (githubToken) {
      // Store token in localStorage for this session
      localStorage.setItem('github_token', githubToken);
      setShowTokenInput(false);
      handleSync();
    }
  };

  // Load token from localStorage on mount
  useState(() => {
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      setGithubToken(savedToken);
    }
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600 dark:text-green-400';
      case 'FAILED':
        return 'text-red-600 dark:text-red-400';
      case 'IN_PROGRESS':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* GitHub Token Input Modal */}
      {showTokenInput && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            GitHub Personal Access Token Required
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
            To sync your repositories, you need a GitHub Personal Access Token with 'repo' scope.
          </p>
          <ol className="text-sm text-blue-800 dark:text-blue-200 mb-4 list-decimal list-inside space-y-1">
            <li>Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
            <li>Click "Generate new token (classic)"</li>
            <li>Give it a name and select the 'repo' scope</li>
            <li>Copy the token and paste it below</li>
          </ol>
          <div className="flex gap-2">
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
            <Button onClick={handleTokenSubmit} disabled={!githubToken}>
              Save & Sync
            </Button>
            <Button variant="secondary" onClick={() => setShowTokenInput(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Sync Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">GitHub Sync</h3>
          <Button
            onClick={handleSync}
            disabled={isSyncing || syncStatus?.status === 'IN_PROGRESS'}
            className="flex items-center gap-2"
          >
            {(isSyncing || syncStatus?.status === 'IN_PROGRESS') && <Spinner size="sm" />}
            {isSyncing || syncStatus?.status === 'IN_PROGRESS' ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>

        {syncStatus && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`font-medium ${getSyncStatusColor(syncStatus.status)}`}>
                {syncStatus.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Sync:</span>
              <span>{formatDate(syncStatus.lastSyncAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Repositories Synced:</span>
              <span>{syncStatus.repositoriesSynced}</span>
            </div>
            {syncStatus.errorMessage && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-600 dark:text-red-400">
                {syncStatus.errorMessage}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Repositories List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Synced Repositories</h3>
          {repositories && repositories.length > 0 && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
        
        {isLoadingRepos ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : repositories && repositories.length > 0 ? (
          <>
            {(() => {
              // Filter repositories based on search query
              const filteredRepos = repositories.filter((repo) =>
                repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
              );

              // Calculate pagination
              const totalPages = Math.ceil(filteredRepos.length / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedRepos = filteredRepos.slice(startIndex, endIndex);

              if (filteredRepos.length === 0) {
                return (
                  <Card className="p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      No repositories found matching "{searchQuery}"
                    </p>
                  </Card>
                );
              }

              return (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    {paginatedRepos.map((repo) => (
                      <GitHubRepositoryCard key={repo.id} repository={repo} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          const showPage =
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1);

                          if (!showPage) {
                            // Show ellipsis
                            if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <span
                                  key={page}
                                  className="px-2 text-gray-500 dark:text-gray-400"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}

                  {/* Results info */}
                  <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredRepos.length)} of{' '}
                    {filteredRepos.length} repositories
                  </div>
                </>
              );
            })()}
          </>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No repositories synced yet. Click "Sync Now" to import your GitHub repositories.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

interface GitHubRepositoryCardProps {
  repository: GitHubRepository;
}

function GitHubRepositoryCard({ repository }: GitHubRepositoryCardProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {repository.name}
          </a>
          {repository.private && (
            <span className="ml-2 text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
              Private
            </span>
          )}
        </div>
      </div>

      {repository.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {repository.description}
        </p>
      )}

      {/* Languages */}
      {repository.languages && Object.keys(repository.languages).length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Languages</h4>
          
          {/* Language bar */}
          <div className="flex h-2 rounded-full overflow-hidden mb-3">
            {Object.entries(repository.languages)
              .sort((a, b) => b[1] - a[1])
              .map(([language, bytes]) => {
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
                  MDX: '#fcb32c',
                  SCSS: '#c6538c',
                  Hack: '#878787',
                  PLpgSQL: '#336791',
                  'Jupyter Notebook': '#DA5B0B',
                  Cuda: '#3A4E3A',
                  Dockerfile: '#384d54',
                  Solidity: '#AA6746',
                  Batchfile: '#C1F12E',
                };
                const color = languageColors[language] || '#8b949e';
                const totalBytes = Object.values(repository.languages).reduce((sum, b) => sum + b, 0);
                const percentage = (bytes / totalBytes) * 100;
                
                return (
                  <div
                    key={language}
                    className="h-full"
                    style={{
                      backgroundColor: color,
                      width: `${percentage}%`,
                    }}
                    title={`${language}: ${percentage.toFixed(1)}%`}
                  />
                );
              })}
          </div>

          {/* Language list */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(repository.languages)
              .sort((a, b) => b[1] - a[1])
              .map(([language, bytes]) => {
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
                  MDX: '#fcb32c',
                  SCSS: '#c6538c',
                  Hack: '#878787',
                  PLpgSQL: '#336791',
                  'Jupyter Notebook': '#DA5B0B',
                  Cuda: '#3A4E3A',
                  Dockerfile: '#384d54',
                  Solidity: '#AA6746',
                  Batchfile: '#C1F12E',
                };
                const color = languageColors[language] || '#8b949e';
                const totalBytes = Object.values(repository.languages).reduce((sum, b) => sum + b, 0);
                const percentage = ((bytes / totalBytes) * 100).toFixed(1);
                
                return (
                  <div key={language} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{language}</span>
                    <span className="text-gray-500 dark:text-gray-500">{percentage}%</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>{repository.stargazers_count}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>{repository.forks_count}</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
        Last synced: {new Date(repository.synced_at).toLocaleDateString()}
      </div>
    </Card>
  );
}
