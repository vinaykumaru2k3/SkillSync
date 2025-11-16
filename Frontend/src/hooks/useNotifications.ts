import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './useToast';
import { notificationService } from '@/lib/api/services/notificationService';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { subscribe, isConnected } = useWebSocket();
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data);
        const unread = data.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };
    
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!isConnected || !user) return;

    const unsubscribe = subscribe(`/user/queue/notifications`, (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      showToast(notification.title, 'info');
    });

    return unsubscribe;
  }, [isConnected, user, subscribe, showToast]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    isConnected,
  };
}
