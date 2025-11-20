package com.skillsync.shared.events;

import java.time.Instant;

public class CollaborationInviteSentEvent {
    private String inviteId;
    private String projectId;
    private String senderId;
    private String receiverId;
    private Instant sentAt;

    public CollaborationInviteSentEvent() {
    }

    public CollaborationInviteSentEvent(String inviteId, String projectId, String senderId, String receiverId) {
        this.inviteId = inviteId;
        this.projectId = projectId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.sentAt = Instant.now();
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

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }
}