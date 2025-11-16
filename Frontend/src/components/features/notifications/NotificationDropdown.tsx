'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { notificationService } from '@/lib/api/services/notificationService';
import { Notification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const displayNotifications = notifications;
  const totalCount = notifications.length;

  const handleClearAll = async () => {
    try {
      await notificationService.clearAll();
      clearAll();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications ({totalCount})</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  Mark all read
                </button>
              )}
              {totalCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {displayNotifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No notifications
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {displayNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification.id);
                    }
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
