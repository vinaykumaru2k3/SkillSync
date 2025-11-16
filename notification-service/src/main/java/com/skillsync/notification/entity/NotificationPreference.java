package com.skillsync.notification.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import java.util.HashMap;
import java.util.Map;

@RedisHash("notification_preferences")
public class NotificationPreference {
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    private Map<NotificationType, DeliveryChannel> preferences;
    
    public NotificationPreference() {
        this.preferences = new HashMap<>();
        initializeDefaults();
    }
    
    private void initializeDefaults() {
        preferences.put(NotificationType.INVITATION, DeliveryChannel.BOTH);
        preferences.put(NotificationType.INVITATION_ACCEPTED, DeliveryChannel.WEBSOCKET);
        preferences.put(NotificationType.INVITATION_DECLINED, DeliveryChannel.WEBSOCKET);
        preferences.put(NotificationType.TASK_ASSIGNED, DeliveryChannel.BOTH);
        preferences.put(NotificationType.TASK_UPDATED, DeliveryChannel.WEBSOCKET);
        preferences.put(NotificationType.TASK_COMMENT, DeliveryChannel.WEBSOCKET);
        preferences.put(NotificationType.MENTION, DeliveryChannel.BOTH);
        preferences.put(NotificationType.FEEDBACK_RECEIVED, DeliveryChannel.BOTH);
        preferences.put(NotificationType.PROJECT_UPDATED, DeliveryChannel.WEBSOCKET);
        preferences.put(NotificationType.COLLABORATION_REMOVED, DeliveryChannel.BOTH);
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Map<NotificationType, DeliveryChannel> getPreferences() {
        return preferences;
    }

    public void setPreferences(Map<NotificationType, DeliveryChannel> preferences) {
        this.preferences = preferences;
    }
    
    public DeliveryChannel getPreference(NotificationType type) {
        return preferences.getOrDefault(type, DeliveryChannel.WEBSOCKET);
    }
}
