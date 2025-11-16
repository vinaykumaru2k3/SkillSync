package com.skillsync.notification.service;

import com.skillsync.notification.dto.NotificationMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WebSocketService {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketService.class);
    
    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, Long> userConnections = new ConcurrentHashMap<>();
    
    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
    public void sendNotificationToUser(String userId, NotificationMessage message) {
        try {
            messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications",
                message
            );
            logger.debug("Sent notification to user {}: {}", userId, message.getTitle());
        } catch (Exception e) {
            logger.error("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }
    
    public void registerConnection(String userId) {
        userConnections.put(userId, System.currentTimeMillis());
        logger.debug("User {} connected to WebSocket", userId);
    }
    
    public void unregisterConnection(String userId) {
        userConnections.remove(userId);
        logger.debug("User {} disconnected from WebSocket", userId);
    }
    
    public boolean isUserConnected(String userId) {
        return userConnections.containsKey(userId);
    }
    
    public void sendHeartbeat(String userId) {
        userConnections.put(userId, System.currentTimeMillis());
    }
}
