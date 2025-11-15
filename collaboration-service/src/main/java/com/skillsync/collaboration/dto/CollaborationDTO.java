package com.skillsync.collaboration.dto;

import com.skillsync.collaboration.entity.CollaborationRole;
import com.skillsync.collaboration.entity.CollaborationStatus;
import com.skillsync.collaboration.entity.Permission;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public class CollaborationDTO {
    private UUID id;
    private UUID projectId;
    private UUID inviterId;
    private UUID inviteeId;
    private CollaborationRole role;
    private CollaborationStatus status;
    private Set<Permission> permissions;
    private Instant invitedAt;
    private Instant respondedAt;
    private Instant expiresAt;
    private Instant createdAt;
    private Instant updatedAt;

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

    public Set<Permission> getPermissions() {
        return permissions;
    }

    public void setPermissions(Set<Permission> permissions) {
        this.permissions = permissions;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
