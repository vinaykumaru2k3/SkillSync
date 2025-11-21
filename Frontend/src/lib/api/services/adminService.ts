import { apiClient } from '../client'

export interface UserRole {
    userId: string
    roles: string[]
}

export interface AdminUser {
    id: string
    email: string
    roles: string[]
    active: boolean
}

export const adminService = {
    // Get all users
    getAllUsers: async (): Promise<AdminUser[]> => {
        return await apiClient.get('/auth/admin/users')
    },

    // Get user roles
    getUserRoles: async (userId: string): Promise<UserRole> => {
        return await apiClient.get(`/auth/admin/users/${userId}/roles`)
    },

    // Add role to user
    addRole: async (userId: string, role: string): Promise<UserRole> => {
        return await apiClient.post(`/auth/admin/users/${userId}/roles`, { role })
    },

    // Remove role from user
    removeRole: async (userId: string, role: string): Promise<UserRole> => {
        return await apiClient.delete(`/auth/admin/users/${userId}/roles/${role}`)
    },
}
