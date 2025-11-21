'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AdminSidebar() {
    const pathname = usePathname()

    const isActive = (path: string) => pathname === path

    const links = [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/users', label: 'User Management' },
        { href: '/admin/moderation', label: 'Content Moderation' },
    ]

    return (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white px-4">Admin Panel</h2>
            </div>
            <nav className="space-y-1">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.href)
                                ? 'bg-blue-50 text-blue-700 dark:bg-gray-900 dark:text-blue-400'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </div>
    )
}
