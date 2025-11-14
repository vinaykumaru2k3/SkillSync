import { apiClient } from '../client';
import type { GitHubRepository, SyncStatus, LanguageStatistics, SyncResponse } from '@/types/github';

export const githubService = {
  /**
   * Trigger manual sync of GitHub repositories
   */
  syncRepositories: async (): Promise<SyncResponse> => {
    const githubToken = localStorage.getItem('github_token');
    const headers: Record<string, string> = {};
    if (githubToken) {
      headers['X-GitHub-Token'] = githubToken;
    }
    const response = await apiClient.post<SyncResponse>('/github/sync', {}, { headers });
    return response;
  },

  /**
   * Get user's synced GitHub repositories
   */
  getRepositories: async (): Promise<GitHubRepository[]> => {
    const response = await apiClient.get<GitHubRepository[]>('/github/repositories');
    return response;
  },

  /**
   * Get language statistics for user
   */
  getLanguageStatistics: async (): Promise<LanguageStatistics> => {
    const response = await apiClient.get<LanguageStatistics>('/github/stats');
    return response;
  },

  /**
   * Get sync status for user
   */
  getSyncStatus: async (): Promise<SyncStatus> => {
    const response = await apiClient.get<SyncStatus>('/github/sync/status');
    return response;
  },
};
