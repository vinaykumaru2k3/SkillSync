import { apiClient } from '../client';
import { Notification, NotificationPreference } from '@/types/notification';

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    return await apiClient.get('/notifications');
  },

  getUnreadNotifications: async (): Promise<Notification[]> => {
    return await apiClient.get('/notifications/unread');
  },

  getUnreadCount: async (): Promise<number> => {
    const data: any = await apiClient.get('/notifications/unread/count');
    return data.count;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },

  getPreferences: async (): Promise<NotificationPreference> => {
    return await apiClient.get('/notifications/preferences');
  },

  updatePreferences: async (preferences: NotificationPreference): Promise<NotificationPreference> => {
    return await apiClient.put('/notifications/preferences', preferences);
  },

  clearAll: async (): Promise<void> => {
    await apiClient.delete('/notifications');
  },
};
