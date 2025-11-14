'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { githubService } from '@/lib/api/services';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import type { GitHubRepository } from '@/types/github';

interface GitHubRepositorySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (repository: GitHubRepository) => void;
}

export function GitHubRepositorySelector({
  isOpen,
  onClose,
  onSelect,
}: GitHubRepositorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);

  const { data: repositories, isLoading } = useQuery({
    queryKey: ['github-repositories'],
    queryFn: githubService.getRepositories,
    enabled: isOpen,
  });

  const filteredRepositories = repositories?.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = () => {
    if (selectedRepo) {
      onSelect(selectedRepo);
      onClose();
      setSelectedRepo(null);
      setSearchQuery('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select GitHub Repository">
      <div className="space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Repository List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : filteredRepositories && filteredRepositories.length > 0 ? (
            filteredRepositories.map((repo) => (
              <button
                key={repo.id}
                onClick={() => setSelectedRepo(repo)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedRepo?.id === repo.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{repo.name}</div>
                    {repo.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-500">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          {repo.language}
                        </span>
                      )}
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🔱 {repo.forks_count}</span>
                    </div>
                  </div>
                  {repo.private && (
                    <span className="ml-2 text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                      Private
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              {searchQuery
                ? 'No repositories found matching your search.'
                : 'No repositories available. Sync your GitHub repositories first.'}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedRepo}>
            Select Repository
          </Button>
        </div>
      </div>
    </Modal>
  );
}
