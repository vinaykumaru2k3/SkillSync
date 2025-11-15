package com.skillsync.collaboration.event;

import java.time.Instant;
import java.util.UUID;

public class CollaborationEvent {
    
    private String eventType;
    private UUID collaborationId;
    private UUID projectId;
    private UUID inviterId;
    private UUID inviteeId;
    private String role;
    private String status;
    private Instant timestamp;

    public CollaborationEvent() {
        this.timestamp = Instant.now();
    }

    // Getters and setters
    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public UUID getCollaborationId() {
        return collaborationId;
    }

    public void setCollaborationId(UUID collaborationId) {
        this.collaborationId = collaborationId;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public UUID getInviterId() {
        return inviterId;
    }

    public void setInviterId(UUID inviterId) {
        this.inviterId = inviterId;
    }

    public UUID getInviteeId() {
        return inviteeId;
    }

    public void setInviteeId(UUID inviteeId) {
        this.inviteeId = inviteeId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
