'use client'

import { useState } from 'react'
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
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
              <Link href="/admin" className={getLinkClass('/admin')}>
                Admin
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
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

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <NotificationDropdown />
              <ThemeToggle />
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            <Link href="/dashboard" className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/dashboard') ? 'bg-blue-50 text-blue-700 dark:bg-gray-900 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`}>
              Dashboard
            </Link>
            <Link href={`/profile/${user?.userId}`} className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/profile') ? 'bg-blue-50 text-blue-700 dark:bg-gray-900 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`}>
              My Profile
            </Link>
            <Link href="/projects" className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/projects') ? 'bg-blue-50 text-blue-700 dark:bg-gray-900 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`}>
              Projects
            </Link>
            <Link href="/collaborations" className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/collaborations') ? 'bg-blue-50 text-blue-700 dark:bg-gray-900 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`}>
              Collaborations
            </Link>
            <Link href="/profile/github" className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/profile/github') ? 'bg-blue-50 text-blue-700 dark:bg-gray-900 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`}>
              GitHub
            </Link>
            <Link href="/search" className={`block rounded-md px-3 py-2 text-base font-medium ${isActive('/search') ? 'bg-blue-50 text-blue-700 dark:bg-gray-900 dark:text-blue-400' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'}`}>
              Discover
            </Link>
          </div>
          <div className="border-t border-gray-200 pb-3 pt-4 dark:border-gray-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                {userProfile?.profileImageUrl ? (
                  <img
                    src={userProfile.profileImageUrl}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-base">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-gray-800 dark:text-white">{userProfile?.displayName || 'User'}</div>
                <div className="text-sm font-medium leading-none text-gray-500 dark:text-gray-400">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1 px-2">
              <Button variant="outline" size="sm" onClick={handleLogout} className="w-full justify-center">
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
