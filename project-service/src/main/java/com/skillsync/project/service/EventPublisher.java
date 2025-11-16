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

    public void publishTaskCommentNotification(com.skillsync.project.entity.TaskComment comment, Task task, UUID projectId, java.util.Set<String> mentions) {
        try {
            
            // Get project collaborators
            java.util.Set<UUID> collaboratorIds = getProjectCollaborators(projectId);
            
            // Notify task assignee about comment
            if (task.getAssigneeId() != null && !task.getAssigneeId().equals(comment.getUserId())) {
                Map<String, Object> userInfo = userServiceClient.getUserById(comment.getUserId().toString());
                String commenterName = (String) userInfo.getOrDefault("displayName", "Someone");
                
                publishNotificationEvent(task.getAssigneeId(), "TASK_COMMENT",
                    "New Comment",
                    commenterName + " commented on task: " + task.getTitle(),
                    "/projects/" + projectId,
                    task.getId().toString());
            }
            
            // Notify mentioned users (only if they are collaborators)
            for (String username : mentions) {
                try {
                    Map<String, Object> mentionedUser = userServiceClient.getUserByUsername(username);
                    if (mentionedUser.isEmpty()) continue;
                    
                    UUID mentionedUserId = UUID.fromString((String) mentionedUser.get("userId"));
                    
                    // Check if mentioned user is a project collaborator
                    if (!collaboratorIds.contains(mentionedUserId)) {
                        log.debug("User {} is not a collaborator, skipping mention notification", username);
                        continue;
                    }
                    
                    if (!mentionedUserId.equals(comment.getUserId())) {
                        Map<String, Object> userInfo = userServiceClient.getUserById(comment.getUserId().toString());
                        String commenterName = (String) userInfo.getOrDefault("displayName", "Someone");
                        
                        String message = commenterName + " mentioned you: \"" + comment.getContent() + "\"";
                        publishNotificationEvent(mentionedUserId, "MENTION",
                            "You were mentioned",
                            message,
                            "/projects/" + projectId,
                            task.getId().toString());
                    }
                } catch (Exception e) {
                    log.warn("Failed to notify mentioned user: {}", username, e);
                }
            }
        } catch (Exception e) {
            log.error("Failed to publish task comment notifications", e);
        }
    }
    
    private java.util.Set<UUID> getProjectCollaborators(UUID projectId) {
        try {
            String url = "http://localhost:8085/api/v1/collaborations/projects/" + projectId;
            Map<String, Object> response = 
                new org.springframework.web.client.RestTemplate().getForObject(url, Map.class);
            
            java.util.Set<UUID> collaboratorIds = new java.util.HashSet<>();
            if (response != null && response.containsKey("data")) {
                java.util.List<Map<String, Object>> collaborators = (java.util.List<Map<String, Object>>) response.get("data");
                if (collaborators != null) {
                    for (Map<String, Object> collab : collaborators) {
                        String inviteeIdStr = (String) collab.get("inviteeId");
                        if (inviteeIdStr != null) {
                            collaboratorIds.add(UUID.fromString(inviteeIdStr));
                        }
                    }
                }
            }
            return collaboratorIds;
        } catch (Exception e) {
            log.error("Failed to fetch project collaborators", e);
            return new java.util.HashSet<>();
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
