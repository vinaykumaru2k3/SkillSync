package com.skillsync.collaboration.service;

import com.skillsync.collaboration.entity.Collaboration;
import com.skillsync.collaboration.event.CollaborationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EventPublisher {

    private static final Logger logger = LoggerFactory.getLogger(EventPublisher.class);

    public void publishInvitationCreated(Collaboration collaboration) {
        CollaborationEvent event = createEvent("INVITATION_CREATED", collaboration);
        publishEvent(event);
    }

    public void publishInvitationAccepted(Collaboration collaboration) {
        CollaborationEvent event = createEvent("INVITATION_ACCEPTED", collaboration);
        publishEvent(event);
    }

    public void publishInvitationDeclined(Collaboration collaboration) {
        CollaborationEvent event = createEvent("INVITATION_DECLINED", collaboration);
        publishEvent(event);
    }

    public void publishCollaborationRevoked(Collaboration collaboration) {
        CollaborationEvent event = createEvent("COLLABORATION_REVOKED", collaboration);
        publishEvent(event);
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
        // TODO: Integrate with RabbitMQ or other message broker
        // For now, just log the event
        logger.info("Publishing event: {} for collaboration {}", 
                event.getEventType(), event.getCollaborationId());
    }
}
