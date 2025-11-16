package com.skillsync.feedback.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class EventPublisher {

    @Autowired(required = false)
    private RabbitTemplate rabbitTemplate;

    public void publishFeedbackReceived(UUID projectOwnerId, UUID projectId, String projectName, String authorName, int rating) {
        if (rabbitTemplate == null) {
            log.warn("RabbitTemplate not available, skipping notification");
            return;
        }

        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("userId", projectOwnerId.toString());
            notification.put("type", "FEEDBACK_RECEIVED");
            notification.put("title", "New Feedback Received");
            notification.put("message", authorName + " left a " + rating + "-star review on " + projectName);
            notification.put("actionUrl", "/projects/" + projectId);
            notification.put("relatedEntityId", projectId.toString());
            notification.put("relatedEntityType", "PROJECT");
            notification.put("timestamp", LocalDateTime.now().toString());

            rabbitTemplate.convertAndSend("notification.exchange", "notification.event", notification);
            log.info("Published FEEDBACK_RECEIVED notification for user {}", projectOwnerId);
        } catch (Exception e) {
            log.error("Failed to publish notification event", e);
        }
    }
}
