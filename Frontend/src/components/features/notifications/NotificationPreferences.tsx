'use client';

import { useState, useEffect } from 'react';
import { notificationService } from '@/lib/api/services/notificationService';
import { NotificationPreference, NotificationType, DeliveryChannel } from '@/types/notification';
import { useToast } from '@/hooks/useToast';

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await notificationService.getPreferences();
      setPreferences(data);
    } catch (error) {
      showToast('Failed to load preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (type: NotificationType, channel: DeliveryChannel) => {
    if (!preferences) return;

    const updated = {
      ...preferences,
      preferences: {
        ...preferences.preferences,
        [type]: channel,
      },
    };

    try {
      await notificationService.updatePreferences(updated);
      setPreferences(updated);
      showToast('Preferences updated', 'success');
    } catch (error) {
      showToast('Failed to update preferences', 'error');
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  const notificationTypes = [
    { type: NotificationType.INVITATION, label: 'Collaboration Invitations' },
    { type: NotificationType.INVITATION_ACCEPTED, label: 'Invitation Accepted' },
    { type: NotificationType.TASK_ASSIGNED, label: 'Task Assignments' },
    { type: NotificationType.TASK_UPDATED, label: 'Task Updates' },
    { type: NotificationType.MENTION, label: 'Mentions' },
    { type: NotificationType.FEEDBACK_RECEIVED, label: 'Feedback Received' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Notification Preferences
      </h3>

      <div className="space-y-3">
        {notificationTypes.map(({ type, label }) => (
          <div key={type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-900 dark:text-white">{label}</span>
            <select
              value={preferences?.preferences[type] || DeliveryChannel.WEBSOCKET}
              onChange={(e) => handleUpdate(type, e.target.value as DeliveryChannel)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={DeliveryChannel.WEBSOCKET}>Real-time only</option>
              <option value={DeliveryChannel.EMAIL}>Email only</option>
              <option value={DeliveryChannel.BOTH}>Both</option>
              <option value={DeliveryChannel.NONE}>None</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
