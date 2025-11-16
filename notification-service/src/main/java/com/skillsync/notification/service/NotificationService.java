package com.skillsync.notification.service;

import com.skillsync.notification.dto.NotificationMessage;
import com.skillsync.notification.dto.NotificationResponse;
import com.skillsync.notification.entity.*;
import com.skillsync.notification.event.NotificationEvent;
import com.skillsync.notification.repository.NotificationPreferenceRepository;
import com.skillsync.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final WebSocketService webSocketService;
    private final EmailService emailService;
    private final UserService userService;
    
    public NotificationService(
            NotificationRepository notificationRepository,
            NotificationPreferenceRepository preferenceRepository,
            WebSocketService webSocketService,
            EmailService emailService,
            UserService userService) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.webSocketService = webSocketService;
        this.emailService = emailService;
        this.userService = userService;
    }
    
    @RabbitListener(queues = "notification.queue")
    public void processNotificationEvent(java.util.Map<String, Object> eventMap) {
        String userId = (String) eventMap.get("userId");
        String typeStr = (String) eventMap.get("type");
        
        logger.info("Processing notification event for user {}: {}", userId, typeStr);
        
        NotificationType type = NotificationType.valueOf(typeStr);
        Notification notification = createNotificationFromMap(eventMap, type);
        notificationRepository.save(notification);
        
        DeliveryChannel channel = getDeliveryChannel(userId, type);
        
        if (channel == DeliveryChannel.WEBSOCKET || channel == DeliveryChannel.BOTH) {
            sendWebSocketNotification(notification);
        }
        
        if (channel == DeliveryChannel.EMAIL || channel == DeliveryChannel.BOTH) {
            if (!webSocketService.isUserConnected(userId)) {
                sendEmailNotification(notification);
            }
        }
    }
    
    private Notification createNotificationFromMap(java.util.Map<String, Object> eventMap, NotificationType type) {
        Notification notification = new Notification();
        notification.setUserId((String) eventMap.get("userId"));
        notification.setType(type);
        notification.setTitle((String) eventMap.get("title"));
        notification.setMessage((String) eventMap.get("message"));
        notification.setRelatedEntityId((String) eventMap.get("relatedEntityId"));
        notification.setRelatedEntityType((String) eventMap.get("relatedEntityType"));
        notification.setActionUrl((String) eventMap.get("actionUrl"));
        return notification;
    }
    
    private DeliveryChannel getDeliveryChannel(String userId, NotificationType type) {
        return preferenceRepository.findByUserId(userId)
                .map(pref -> pref.getPreference(type))
                .orElse(DeliveryChannel.WEBSOCKET);
    }
    
    private void sendWebSocketNotification(Notification notification) {
        NotificationMessage message = new NotificationMessage();
        message.setId(notification.getId());
        message.setType(notification.getType());
        message.setTitle(notification.getTitle());
        message.setMessage(notification.getMessage());
        message.setActionUrl(notification.getActionUrl());
        message.setCreatedAt(notification.getCreatedAt());
        
        webSocketService.sendNotificationToUser(notification.getUserId(), message);
    }
    
    private void sendEmailNotification(Notification notification) {
        try {
            String userEmail = userService.getUserEmail(notification.getUserId());
            if (userEmail != null) {
                String body = emailService.buildEmailBody(
                    notification.getType(),
                    notification.getTitle(),
                    notification.getMessage(),
                    notification.getActionUrl()
                );
                emailService.sendEmail(userEmail, notification.getTitle(), body);
            }
        } catch (Exception e) {
            logger.error("Failed to send email notification: {}", e.getMessage());
        }
    }
    
    public List<NotificationResponse> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public List<NotificationResponse> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }
    
    public void markAsRead(String notificationId, String userId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            if (notification.getUserId().equals(userId)) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        });
    }
    
    public void markAllAsRead(String userId) {
        notificationRepository.findByUserIdAndReadOrderByCreatedAtDesc(userId, false)
                .forEach(notification -> {
                    notification.setRead(true);
                    notificationRepository.save(notification);
                });
    }
    
    public NotificationPreference getUserPreferences(String userId) {
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    NotificationPreference pref = new NotificationPreference();
                    pref.setUserId(userId);
                    return preferenceRepository.save(pref);
                });
    }
    
    public NotificationPreference updatePreferences(String userId, NotificationPreference preferences) {
        preferences.setUserId(userId);
        return preferenceRepository.save(preferences);
    }
    
    public void clearAllNotifications(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(notifications);
    }
    
    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setType(notification.getType());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setRelatedEntityId(notification.getRelatedEntityId());
        response.setRelatedEntityType(notification.getRelatedEntityType());
        response.setActionUrl(notification.getActionUrl());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        response.setReadAt(notification.getReadAt());
        return response;
    }
}
