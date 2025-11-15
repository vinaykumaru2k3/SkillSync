package com.skillsync.collaboration.dto;

import com.skillsync.collaboration.entity.CollaborationRole;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class InvitationRequest {
    
    @NotNull(message = "Project ID is required")
    private UUID projectId;
    
    @NotNull(message = "Invitee ID is required")
    private UUID inviteeId;
    
    @NotNull(message = "Role is required")
    private CollaborationRole role;

    // Getters and setters
    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public UUID getInviteeId() {
        return inviteeId;
    }

    public void setInviteeId(UUID inviteeId) {
        this.inviteeId = inviteeId;
    }

    public CollaborationRole getRole() {
        return role;
    }

    public void setRole(CollaborationRole role) {
        this.role = role;
    }
}
