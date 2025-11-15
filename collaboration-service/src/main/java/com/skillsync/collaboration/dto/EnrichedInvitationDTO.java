package com.skillsync.collaboration.dto;

import com.skillsync.collaboration.entity.CollaborationRole;
import com.skillsync.collaboration.entity.CollaborationStatus;

import java.time.Instant;
import java.util.UUID;

public class EnrichedInvitationDTO {
    private UUID id;
    private UUID projectId;
    private String projectName;
    private String projectDescription;
    private UUID inviterId;
    private String inviterUsername;
    private String inviterDisplayName;
    private UUID inviteeId;
    private String inviteeUsername;
    private String inviteeDisplayName;
    private CollaborationRole role;
    private CollaborationStatus status;
    private Instant invitedAt;
    private Instant respondedAt;
    private Instant expiresAt;

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getProjectDescription() {
        return projectDescription;
    }

    public void setProjectDescription(String projectDescription) {
        this.projectDescription = projectDescription;
    }

    public UUID getInviterId() {
        return inviterId;
    }

    public void setInviterId(UUID inviterId) {
        this.inviterId = inviterId;
    }

    public String getInviterUsername() {
        return inviterUsername;
    }

    public void setInviterUsername(String inviterUsername) {
        this.inviterUsername = inviterUsername;
    }

    public String getInviterDisplayName() {
        return inviterDisplayName;
    }

    public void setInviterDisplayName(String inviterDisplayName) {
        this.inviterDisplayName = inviterDisplayName;
    }

    public UUID getInviteeId() {
        return inviteeId;
    }

    public void setInviteeId(UUID inviteeId) {
        this.inviteeId = inviteeId;
    }

    public String getInviteeUsername() {
        return inviteeUsername;
    }

    public void setInviteeUsername(String inviteeUsername) {
        this.inviteeUsername = inviteeUsername;
    }

    public String getInviteeDisplayName() {
        return inviteeDisplayName;
    }

    public void setInviteeDisplayName(String inviteeDisplayName) {
        this.inviteeDisplayName = inviteeDisplayName;
    }

    public CollaborationRole getRole() {
        return role;
    }

    public void setRole(CollaborationRole role) {
        this.role = role;
    }

    public CollaborationStatus getStatus() {
        return status;
    }

    public void setStatus(CollaborationStatus status) {
        this.status = status;
    }

    public Instant getInvitedAt() {
        return invitedAt;
    }

    public void setInvitedAt(Instant invitedAt) {
        this.invitedAt = invitedAt;
    }

    public Instant getRespondedAt() {
        return respondedAt;
    }

    public void setRespondedAt(Instant respondedAt) {
        this.respondedAt = respondedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }
}