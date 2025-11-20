package com.skillsync.shared.events;

import java.time.Instant;

public class CollaborationInviteAcceptedEvent {
    private String inviteId;
    private String projectId;
    private String receiverId;
    private Instant acceptedAt;

    public CollaborationInviteAcceptedEvent() {
    }

    public CollaborationInviteAcceptedEvent(String inviteId, String projectId, String receiverId) {
        this.inviteId = inviteId;
        this.projectId = projectId;
        this.receiverId = receiverId;
        this.acceptedAt = Instant.now();
    }

    public String getInviteId() {
        return inviteId;
    }

    public void setInviteId(String inviteId) {
        this.inviteId = inviteId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }

    public Instant getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(Instant acceptedAt) {
        this.acceptedAt = acceptedAt;
    }
}