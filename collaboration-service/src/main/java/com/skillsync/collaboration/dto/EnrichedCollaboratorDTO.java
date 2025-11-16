package com.skillsync.collaboration.dto;

import com.skillsync.collaboration.entity.CollaborationRole;
import com.skillsync.collaboration.entity.CollaborationStatus;

import java.time.Instant;
import java.util.UUID;

public class EnrichedCollaboratorDTO {
    private UUID id;
    private UUID projectId;
    private UUID inviterId;
    private UUID inviteeId;
    private CollaborationRole role;
    private CollaborationStatus status;
    private Instant invitedAt;
    private Instant respondedAt;
    private Instant createdAt;
    
    // Enriched user fields
    private String inviteeUsername;
    private String inviteeDisplayName;
    private String inviteeProfileImageUrl;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }

    public UUID getInviterId() { return inviterId; }
    public void setInviterId(UUID inviterId) { this.inviterId = inviterId; }

    public UUID getInviteeId() { return inviteeId; }
    public void setInviteeId(UUID inviteeId) { this.inviteeId = inviteeId; }

    public CollaborationRole getRole() { return role; }
    public void setRole(CollaborationRole role) { this.role = role; }

    public CollaborationStatus getStatus() { return status; }
    public void setStatus(CollaborationStatus status) { this.status = status; }

    public Instant getInvitedAt() { return invitedAt; }
    public void setInvitedAt(Instant invitedAt) { this.invitedAt = invitedAt; }

    public Instant getRespondedAt() { return respondedAt; }
    public void setRespondedAt(Instant respondedAt) { this.respondedAt = respondedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getInviteeUsername() { return inviteeUsername; }
    public void setInviteeUsername(String inviteeUsername) { this.inviteeUsername = inviteeUsername; }

    public String getInviteeDisplayName() { return inviteeDisplayName; }
    public void setInviteeDisplayName(String inviteeDisplayName) { this.inviteeDisplayName = inviteeDisplayName; }

    public String getInviteeProfileImageUrl() { return inviteeProfileImageUrl; }
    public void setInviteeProfileImageUrl(String inviteeProfileImageUrl) { this.inviteeProfileImageUrl = inviteeProfileImageUrl; }
}
