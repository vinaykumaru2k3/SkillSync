'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/common/Button'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [showLanding, setShowLanding] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard')
      } else {
        setShowLanding(true)
      }
    }
  }, [user, isLoading, router])

  if (!showLanding) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-pulse text-2xl font-semibold text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              SkillSync
            </h1>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto max-w-3xl px-6">
        <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Connect with developers
          </h1>

          <p className="mb-10 max-w-xl text-lg text-gray-600 dark:text-gray-400">
            Showcase your skills, discover talented collaborators, and build projects together.
          </p>

          <div className="flex gap-4">
            <Link href="/register">
              <Button size="lg">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-500">
            &copy; 2025 SkillSync
          </p>
        </div>
      </footer>
    </div>
  )
}
