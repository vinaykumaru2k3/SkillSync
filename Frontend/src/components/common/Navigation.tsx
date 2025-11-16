'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useUserProfile } from '@/hooks/useUserProfile'
import { Button } from './Button'
import { ThemeToggle } from './ThemeToggle'
import { NotificationDropdown } from '@/components/features/notifications'

export function Navigation() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { profile: userProfile, hasProfile } = useUserProfile()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  const isActive = (path: string) => {
    if (!pathname) return false
    
    // Exact match for dashboard
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    
    // For GitHub integration, check exact match or with trailing slash
    if (path === '/profile/github') {
      return pathname === '/profile/github' || pathname.startsWith('/profile/github/')
    }
    
    // For profile paths, check if it starts with /profile/ followed by a UUID
    if (path === '/profile') {
      return pathname.startsWith('/profile/') && !pathname.startsWith('/profile/github')
    }
    
    // For other paths, check if pathname starts with the path
    if (pathname.startsWith(path)) {
      // Check if it's an exact match or followed by a slash
      return pathname === path || pathname.charAt(path.length) === '/'
    }
    
    return false
  }

  const getLinkClass = (path: string) => {
    const baseClass = "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
    const activeClass = "text-blue-600 dark:text-blue-400 font-semibold"
    return isActive(path) ? activeClass : baseClass
  }

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard">
              <h1 className="text-xl font-bold cursor-pointer hover:text-blue-600">SkillSync</h1>
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="/dashboard" className={getLinkClass('/dashboard')}>
                Dashboard
              </Link>
              <Link href={`/profile/${user?.userId}`} className={getLinkClass('/profile')}>
                My Profile
              </Link>
              <Link href="/projects" className={getLinkClass('/projects')}>
                Projects
              </Link>
              <Link href="/collaborations" className={getLinkClass('/collaborations')}>
                Collaborations
              </Link>
              <Link href="/profile/github" className={getLinkClass('/profile/github')}>
                GitHub
              </Link>
              <Link href="/search" className={getLinkClass('/search')}>
                Discover
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <ThemeToggle />
            {hasProfile && (
              <button
                onClick={() => router.push(`/profile/${user?.userId}`)}
                className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity"
                title="View Profile"
              >
                {userProfile?.profileImageUrl ? (
                  <img
                    src={userProfile.profileImageUrl}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
