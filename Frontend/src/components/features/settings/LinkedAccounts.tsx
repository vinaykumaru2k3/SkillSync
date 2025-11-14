'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accountLinkingService } from '@/lib/api/services/accountLinkingService'
import { Button } from '@/components/common/Button'
import { Spinner } from '@/components/common/Spinner'
import { useToast } from '@/hooks/useToast'

export const LinkedAccounts = () => {
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: linkedAccounts, isLoading } = useQuery({
    queryKey: ['linkedProviders'],
    queryFn: () => accountLinkingService.getLinkedProviders(),
  })

  const unlinkMutation = useMutation({
    mutationFn: (provider: string) => accountLinkingService.unlinkProvider(provider),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['linkedProviders'] })
      toast.success(`${data.provider} disconnected successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to disconnect provider')
    },
  })

  const handleConnectGithub = () => {
    // Redirect to GitHub OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/github`
  }

  const handleUnlink = (provider: string) => {
    if (!linkedAccounts?.canUnlinkProvider) {
      toast.error('Cannot disconnect your last authentication method. Please set a password first.')
      return
    }

    if (confirm(`Are you sure you want to disconnect ${provider}? You can reconnect it anytime.`)) {
      unlinkMutation.mutate(provider)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    )
  }

  const isGithubLinked = linkedAccounts?.linkedProviders.includes('github')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Connected Accounts
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage how you sign in to SkillSync
        </p>
      </div>

      <div className="space-y-4">
        {/* Email/Password */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Email & Password
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {linkedAccounts?.email}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {linkedAccounts?.hasPassword ? (
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                ✓ Connected
              </span>
            ) : (
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/settings/password'}>
                Set Password
              </Button>
            )}
          </div>
        </div>

        {/* GitHub OAuth */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 dark:bg-gray-700">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                GitHub
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Sign in with your GitHub account
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isGithubLinked ? (
              <>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  ✓ Connected
                </span>
                {linkedAccounts?.canUnlinkProvider && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnlink('github')}
                    disabled={unlinkMutation.isPending}
                  >
                    {unlinkMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
                  </Button>
                )}
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={handleConnectGithub}>
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Warning message */}
      {!linkedAccounts?.canUnlinkProvider && (
        <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You need at least one way to sign in. Set a password before disconnecting your last OAuth provider.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
