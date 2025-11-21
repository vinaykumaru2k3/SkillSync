'use client'

import { useState } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { adminService } from '@/lib/api/services/adminService'

export default function UserManagementPage() {
    const [users, setUsers] = useState([
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'User', status: 'Active', roles: ['ROLE_USER'] },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', status: 'Active', roles: ['ROLE_USER', 'ROLE_ADMIN'] },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'User', status: 'Suspended', roles: ['ROLE_USER'] },
        { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'Active', roles: ['ROLE_USER'] },
    ])

    const toggleStatus = (userId: string) => {
        setUsers(users.map(user => {
            if (user.id === userId) {
                return { ...user, status: user.status === 'Active' ? 'Suspended' : 'Active' }
            }
            return user
        }))
    }

    const grantAdminRole = async (userId: string) => {
        try {
            await adminService.addRole(userId, 'ROLE_ADMIN')
            setUsers(users.map(user => {
                if (user.id === userId) {
                    return { ...user, roles: [...user.roles, 'ROLE_ADMIN'], role: 'Admin' }
                }
                return user
            }))
        } catch (error) {
            console.error('Failed to grant admin role:', error)
            alert('Failed to grant admin role. Please try again.')
        }
    }

    const revokeAdminRole = async (userId: string) => {
        try {
            await adminService.removeRole(userId, 'ROLE_ADMIN')
            setUsers(users.map(user => {
                if (user.id === userId) {
                    return { ...user, roles: user.roles.filter(r => r !== 'ROLE_ADMIN'), role: 'User' }
                }
                return user
            }))
        } catch (error) {
            console.error('Failed to revoke admin role:', error)
            alert('Failed to revoke admin role. Please try again.')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                <Button>Add User</Button>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'Active'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {user.roles.includes('ROLE_ADMIN') ? (
                                            <button
                                                onClick={() => revokeAdminRole(user.id)}
                                                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                                            >
                                                Revoke Admin
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => grantAdminRole(user.id)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                Grant Admin
                                            </button>
                                        )}
                                        <button
                                            onClick={() => toggleStatus(user.id)}
                                            className={`text-sm ${user.status === 'Active'
                                                    ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                                    : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                }`}
                                        >
                                            {user.status === 'Active' ? 'Suspend' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
