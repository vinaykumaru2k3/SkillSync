export interface GitHubRepository {
  id: string;
  userId: string;
  github_id: number;
  name: string;
  full_name: string;
  description: string | null;
  url: string;
  html_url: string;
  language: string | null;
  languages: Record<string, number>;
  stargazers_count: number;
  forks_count: number;
  private: boolean;
  last_commit_at: string | null;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface SyncStatus {
  id: string;
  userId: string;
  lastSyncAt: string;
  status: 'SUCCESS' | 'FAILED' | 'IN_PROGRESS';
  errorMessage: string | null;
  repositoriesSynced: number;
  createdAt: string;
  updatedAt: string;
}

export interface LanguageStatistics {
  userId: string;
  languages: Record<string, number>;
}

export interface SyncResponse {
  message: string;
  count: number;
  repositories: GitHubRepository[];
}
