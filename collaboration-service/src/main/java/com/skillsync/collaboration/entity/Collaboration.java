package com.skillsync.collaboration.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "collaborations")
public class Collaboration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID projectId;

    @Column(nullable = false)
    private UUID inviterId;

    @Column(nullable = false)
    private UUID inviteeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CollaborationRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CollaborationStatus status;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "collaboration_permissions", joinColumns = @JoinColumn(name = "collaboration_id"))
    @Column(name = "permission")
    @Enumerated(EnumType.STRING)
    private Set<Permission> permissions = new HashSet<>();

    @Column(nullable = false)
    private Instant invitedAt;

    private Instant respondedAt;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        invitedAt = Instant.now();
        if (expiresAt == null) {
            // Default expiration: 7 days from invitation
            expiresAt = Instant.now().plusSeconds(7 * 24 * 60 * 60);
        }
        if (status == null) {
            status = CollaborationStatus.PENDING;
        }
        // Set default permissions based on role
        if (permissions.isEmpty() && role != null) {
            permissions.addAll(role.getDefaultPermissions());
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

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
        // Update permissions when role changes
        if (role != null) {
            this.permissions.clear();
            this.permissions.addAll(role.getDefaultPermissions());
        }
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

    // Helper methods
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isPending() {
        return status == CollaborationStatus.PENDING;
    }

    public boolean isActive() {
        return status == CollaborationStatus.ACCEPTED;
    }

    public boolean hasPermission(Permission permission) {
        return permissions.contains(permission);
    }
}
