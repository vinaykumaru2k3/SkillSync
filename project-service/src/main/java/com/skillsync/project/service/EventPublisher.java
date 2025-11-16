package com.skillsync.project.service;

import com.skillsync.project.client.UserServiceClient;
import com.skillsync.project.entity.Project;
import com.skillsync.project.entity.Task;
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

    @Autowired
    private UserServiceClient userServiceClient;

    public void publishTaskAssigned(Task task, Project project) {
        if (task.getAssigneeId() == null) return;
        publishNotificationEvent(task.getAssigneeId(), "TASK_ASSIGNED", 
            "Task Assigned", 
            "You have been assigned to task: " + task.getTitle(),
            "/projects/" + project.getId(),
            task.getId().toString());
    }

    public void publishTaskUpdated(Task task, Project project, UUID userId) {
        if (task.getAssigneeId() != null && !task.getAssigneeId().equals(userId)) {
            publishNotificationEvent(task.getAssigneeId(), "TASK_UPDATED",
                "Task Updated",
                "Task \"" + task.getTitle() + "\" has been updated",
                "/projects/" + project.getId(),
                task.getId().toString());
        }
    }

    public void publishProjectUpdated(Project project, UUID userId) {
        // Notify project owner if someone else updated
        if (!project.getOwnerId().equals(userId)) {
            publishNotificationEvent(project.getOwnerId(), "PROJECT_UPDATED",
                "Project Updated",
                "Project \"" + project.getName() + "\" has been updated",
                "/projects/" + project.getId(),
                project.getId().toString());
        }
    }

    private void publishNotificationEvent(UUID userId, String type, String title, String message, String actionUrl, String relatedEntityId) {
        if (rabbitTemplate == null) {
            log.warn("RabbitTemplate not available, skipping notification");
            return;
        }

        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("userId", userId.toString());
            notification.put("type", type);
            notification.put("title", title);
            notification.put("message", message);
            notification.put("actionUrl", actionUrl);
            notification.put("relatedEntityId", relatedEntityId);
            notification.put("relatedEntityType", "TASK");
            notification.put("timestamp", LocalDateTime.now().toString());

            rabbitTemplate.convertAndSend("notification.exchange", "notification.event", notification);
            log.info("Published notification event: {} for user {}", type, userId);
        } catch (Exception e) {
            log.error("Failed to publish notification event", e);
        }
    }
}
