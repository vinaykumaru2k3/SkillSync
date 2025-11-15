'use client'

import { ProtectedRoute } from '@/components/auth'
import { Navigation } from '@/components/common/Navigation'
import { Card } from '@/components/common/Card'
import { PendingInvitations } from '@/components/features/collaboration'

export default function CollaborationsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Collaborations</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your project invitations and collaborations
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-1">
            {/* Pending Invitations Section */}
            <Card>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Pending Invitations
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Review and respond to project collaboration invitations
                </p>
              </div>
              <PendingInvitations />
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    About Collaborations
                  </h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                    When you accept an invitation, you'll be able to view and contribute to the project based on your assigned role:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    <li>• <strong>Viewer:</strong> Can view project details and tasks</li>
                    <li>• <strong>Editor:</strong> Can view, create, and edit tasks</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
