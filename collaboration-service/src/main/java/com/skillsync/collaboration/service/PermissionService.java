package com.skillsync.collaboration.service;

import com.skillsync.collaboration.entity.Collaboration;
import com.skillsync.collaboration.entity.CollaborationStatus;
import com.skillsync.collaboration.entity.Permission;
import com.skillsync.collaboration.repository.CollaborationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class PermissionService {

    private static final Logger logger = LoggerFactory.getLogger(PermissionService.class);

    @Autowired
    private CollaborationRepository collaborationRepository;

    /**
     * Check if a user has a specific permission for a project
     */
    public boolean checkPermission(UUID projectId, UUID userId, Permission permission) {
        logger.debug("Checking {} permission for user {} on project {}", 
                permission, userId, projectId);

        Optional<Collaboration> collaboration = collaborationRepository
                .findByProjectIdAndInviteeIdAndStatus(projectId, userId, CollaborationStatus.ACCEPTED);

        if (collaboration.isEmpty()) {
            logger.debug("No active collaboration found for user {} on project {}", userId, projectId);
            return false;
        }

        boolean hasPermission = collaboration.get().hasPermission(permission);
        logger.debug("User {} {} {} permission for project {}", 
                userId, hasPermission ? "has" : "does not have", permission, projectId);

        return hasPermission;
    }

    /**
     * Get all permissions for a user on a project
     */
    public Set<Permission> getUserPermissions(UUID projectId, UUID userId) {
        logger.debug("Getting permissions for user {} on project {}", userId, projectId);

        return collaborationRepository
                .findByProjectIdAndInviteeIdAndStatus(projectId, userId, CollaborationStatus.ACCEPTED)
                .map(Collaboration::getPermissions)
                .orElse(Set.of());
    }

    /**
     * Check if a user is a collaborator on a project (has any active collaboration)
     */
    public boolean isCollaborator(UUID projectId, UUID userId) {
        logger.debug("Checking if user {} is a collaborator on project {}", userId, projectId);

        return collaborationRepository
                .findByProjectIdAndInviteeIdAndStatus(projectId, userId, CollaborationStatus.ACCEPTED)
                .isPresent();
    }

    /**
     * Validate that a user has all required permissions
     */
    public boolean hasAllPermissions(UUID projectId, UUID userId, Set<Permission> requiredPermissions) {
        Set<Permission> userPermissions = getUserPermissions(projectId, userId);
        return userPermissions.containsAll(requiredPermissions);
    }

    /**
     * Validate that a user has at least one of the required permissions
     */
    public boolean hasAnyPermission(UUID projectId, UUID userId, Set<Permission> requiredPermissions) {
        Set<Permission> userPermissions = getUserPermissions(projectId, userId);
        return requiredPermissions.stream().anyMatch(userPermissions::contains);
    }
}
