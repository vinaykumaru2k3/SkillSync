'use client';

import { useAuth } from '@/contexts/AuthContext';
import { GitHubSync, GitHubLanguageStats } from '@/components/features/profile';
import { Card } from '@/components/common/Card';
import { Navigation } from '@/components/common/Navigation';
import { Tooltip } from '@/components/common/Tooltip';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function GitHubIntegrationPage() {
  useAuthGuard();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Please log in to access GitHub integration.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">GitHub Integration</h1>
            <Tooltip
              content={
                <div className="space-y-1">
                  <p className="font-semibold mb-2">About GitHub Integration</p>
                  <p>• Automatically sync your public and private repositories</p>
                  <p>• Display language statistics and project metrics</p>
                  <p>• Link repositories to your SkillSync projects</p>
                  <p>• Keep your portfolio up-to-date with real-time updates</p>
                </div>
              }
              position="bottom"
            >
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </Tooltip>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Sync your GitHub repositories and showcase your coding projects
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Sync and Repositories */}
          <div className="lg:col-span-2">
            <GitHubSync />
          </div>

          {/* Right Column - Language Stats */}
          <div className="lg:col-span-1">
            <GitHubLanguageStats userId={user.userId} />
          </div>
        </div>


      </div>
      </div>
    </div>
  );
}
