export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

export enum NotificationType {
  INVITATION = 'INVITATION',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  INVITATION_DECLINED = 'INVITATION_DECLINED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMMENT = 'TASK_COMMENT',
  MENTION = 'MENTION',
  FEEDBACK_RECEIVED = 'FEEDBACK_RECEIVED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  COLLABORATION_REMOVED = 'COLLABORATION_REMOVED',
}

export interface NotificationPreference {
  id?: string;
  userId: string;
  preferences: Record<NotificationType, DeliveryChannel>;
}

export enum DeliveryChannel {
  WEBSOCKET = 'WEBSOCKET',
  EMAIL = 'EMAIL',
  BOTH = 'BOTH',
  NONE = 'NONE',
}
