package com.skillsync.collaboration.service;

import com.skillsync.collaboration.client.ProjectServiceClient;
import com.skillsync.collaboration.client.UserServiceClient;
import com.skillsync.collaboration.entity.Collaboration;
import com.skillsync.collaboration.event.CollaborationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class EventPublisher {

    private static final Logger logger = LoggerFactory.getLogger(EventPublisher.class);
    
    @Autowired(required = false)
    private RabbitTemplate rabbitTemplate;
    
    @Autowired
    private UserServiceClient userServiceClient;
    
    @Autowired
    private ProjectServiceClient projectServiceClient;

    public void publishInvitationCreated(Collaboration collaboration) {
        CollaborationEvent event = createEvent("INVITATION_CREATED", collaboration);
        publishEvent(event);
        publishNotificationEvent(collaboration, "INVITATION");
    }

    public void publishInvitationAccepted(Collaboration collaboration) {
        CollaborationEvent event = createEvent("INVITATION_ACCEPTED", collaboration);
        publishEvent(event);
        publishNotificationEvent(collaboration, "INVITATION_ACCEPTED");
    }

    public void publishInvitationDeclined(Collaboration collaboration) {
        CollaborationEvent event = createEvent("INVITATION_DECLINED", collaboration);
        publishEvent(event);
        publishNotificationEvent(collaboration, "INVITATION_DECLINED");
    }

    public void publishCollaborationRevoked(Collaboration collaboration) {
        CollaborationEvent event = createEvent("COLLABORATION_REVOKED", collaboration);
        publishEvent(event);
        publishNotificationEvent(collaboration, "COLLABORATION_REMOVED");
    }

    private CollaborationEvent createEvent(String eventType, Collaboration collaboration) {
        CollaborationEvent event = new CollaborationEvent();
        event.setEventType(eventType);
        event.setCollaborationId(collaboration.getId());
        event.setProjectId(collaboration.getProjectId());
        event.setInviterId(collaboration.getInviterId());
        event.setInviteeId(collaboration.getInviteeId());
        event.setRole(collaboration.getRole().name());
        event.setStatus(collaboration.getStatus().name());
        return event;
    }

    private void publishEvent(CollaborationEvent event) {
        logger.info("Publishing event: {} for collaboration {}", 
                event.getEventType(), event.getCollaborationId());
    }
    
    private void publishNotificationEvent(Collaboration collaboration, String notificationType) {
        if (rabbitTemplate == null) {
            logger.warn("RabbitTemplate not available, skipping notification");
            return;
        }
        
        try {
            UserServiceClient.UserInfo inviter = userServiceClient.getUserInfo(collaboration.getInviterId());
            ProjectServiceClient.ProjectInfo project = projectServiceClient.getProjectInfo(collaboration.getProjectId());
            
            Map<String, Object> notification = new HashMap<>();
            notification.put("userId", collaboration.getInviteeId().toString());
            notification.put("type", notificationType);
            notification.put("relatedEntityId", collaboration.getProjectId().toString());
            notification.put("relatedEntityType", "PROJECT");
            notification.put("timestamp", LocalDateTime.now().toString());
            
            switch (notificationType) {
                case "INVITATION":
                    notification.put("title", "New Collaboration Invitation");
                    notification.put("message", inviter.getDisplayName() + " invited you to collaborate on " + project.getName());
                    notification.put("actionUrl", "/collaborations");
                    break;
                case "INVITATION_ACCEPTED":
                    notification.put("userId", collaboration.getInviterId().toString());
                    UserServiceClient.UserInfo invitee = userServiceClient.getUserInfo(collaboration.getInviteeId());
                    notification.put("title", "Invitation Accepted");
                    notification.put("message", invitee.getDisplayName() + " accepted your invitation to " + project.getName());
                    notification.put("actionUrl", "/projects/" + collaboration.getProjectId());
                    break;
                case "INVITATION_DECLINED":
                    notification.put("userId", collaboration.getInviterId().toString());
                    UserServiceClient.UserInfo decliner = userServiceClient.getUserInfo(collaboration.getInviteeId());
                    notification.put("title", "Invitation Declined");
                    notification.put("message", decliner.getDisplayName() + " declined your invitation to " + project.getName());
                    notification.put("actionUrl", "/projects/" + collaboration.getProjectId());
                    break;
                case "COLLABORATION_REMOVED":
                    notification.put("title", "Collaboration Removed");
                    notification.put("message", "You have been removed from " + project.getName());
                    notification.put("actionUrl", "/projects");
                    break;
            }
            
            rabbitTemplate.convertAndSend("notification.exchange", "notification.event", notification);
            logger.info("Published notification event: {} for user {}", notificationType, notification.get("userId"));
        } catch (Exception e) {
            logger.error("Failed to publish notification event", e);
        }
    }
}
