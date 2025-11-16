package com.skillsync.collaboration.service;

import com.skillsync.collaboration.client.ProjectServiceClient;
import com.skillsync.collaboration.client.UserServiceClient;
import com.skillsync.collaboration.dto.CollaborationDTO;
import com.skillsync.collaboration.dto.EnrichedCollaboratorDTO;
import com.skillsync.collaboration.dto.EnrichedInvitationDTO;
import com.skillsync.collaboration.dto.InvitationRequest;
import com.skillsync.collaboration.entity.Collaboration;
import com.skillsync.collaboration.entity.CollaborationRole;
import com.skillsync.collaboration.entity.CollaborationStatus;
import com.skillsync.collaboration.entity.Permission;
import com.skillsync.collaboration.exception.CollaborationException;
import com.skillsync.collaboration.mapper.CollaborationMapper;
import com.skillsync.collaboration.repository.CollaborationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CollaborationService {

    private static final Logger logger = LoggerFactory.getLogger(CollaborationService.class);

    @Autowired
    private CollaborationRepository collaborationRepository;

    @Autowired
    private CollaborationMapper collaborationMapper;

    @Autowired
    private EventPublisher eventPublisher;

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private ProjectServiceClient projectServiceClient;

    @Transactional
    public CollaborationDTO createInvitation(UUID inviterId, InvitationRequest request) {
        logger.info("Creating invitation from user {} to user {} for project {}", 
                inviterId, request.getInviteeId(), request.getProjectId());

        // Validate that inviter is not inviting themselves
        if (inviterId.equals(request.getInviteeId())) {
            throw new CollaborationException("Cannot invite yourself to collaborate");
        }

        // Check if there's already an active or pending invitation
        boolean exists = collaborationRepository.existsByProjectIdAndInviteeIdAndStatus(
                request.getProjectId(), request.getInviteeId(), CollaborationStatus.PENDING);
        
        if (exists) {
            throw new CollaborationException("An invitation already exists for this user on this project");
        }

        boolean isActive = collaborationRepository.existsByProjectIdAndInviteeIdAndStatus(
                request.getProjectId(), request.getInviteeId(), CollaborationStatus.ACCEPTED);
        
        if (isActive) {
            throw new CollaborationException("User is already a collaborator on this project");
        }

        Collaboration collaboration = new Collaboration();
        collaboration.setProjectId(request.getProjectId());
        collaboration.setInviterId(inviterId);
        collaboration.setInviteeId(request.getInviteeId());
        collaboration.setRole(request.getRole());
        collaboration.setStatus(CollaborationStatus.PENDING);

        Collaboration saved = collaborationRepository.save(collaboration);
        
        // Publish invitation created event
        eventPublisher.publishInvitationCreated(saved);

        logger.info("Invitation created successfully with ID: {}", saved.getId());
        return collaborationMapper.toDTO(saved);
    }

    @Transactional
    public CollaborationDTO acceptInvitation(UUID invitationId, UUID userId) {
        logger.info("User {} accepting invitation {}", userId, invitationId);

        Collaboration collaboration = collaborationRepository.findById(invitationId)
                .orElseThrow(() -> new CollaborationException("Invitation not found"));

        // Validate that the user is the invitee
        if (!collaboration.getInviteeId().equals(userId)) {
            throw new CollaborationException("You are not authorized to accept this invitation");
        }

        // Check if invitation is still pending
        if (collaboration.getStatus() != CollaborationStatus.PENDING) {
            throw new CollaborationException("Invitation is no longer pending");
        }

        // Check if invitation has expired
        if (collaboration.isExpired()) {
            collaboration.setStatus(CollaborationStatus.DECLINED);
            collaborationRepository.save(collaboration);
            throw new CollaborationException("Invitation has expired");
        }

        collaboration.setStatus(CollaborationStatus.ACCEPTED);
        collaboration.setRespondedAt(Instant.now());
        Collaboration saved = collaborationRepository.save(collaboration);

        // Publish invitation accepted event
        eventPublisher.publishInvitationAccepted(saved);

        logger.info("Invitation {} accepted successfully", invitationId);
        return collaborationMapper.toDTO(saved);
    }

    @Transactional
    public CollaborationDTO declineInvitation(UUID invitationId, UUID userId) {
        logger.info("User {} declining invitation {}", userId, invitationId);

        Collaboration collaboration = collaborationRepository.findById(invitationId)
                .orElseThrow(() -> new CollaborationException("Invitation not found"));

        // Validate that the user is the invitee
        if (!collaboration.getInviteeId().equals(userId)) {
            throw new CollaborationException("You are not authorized to decline this invitation");
        }

        // Check if invitation is still pending
        if (collaboration.getStatus() != CollaborationStatus.PENDING) {
            throw new CollaborationException("Invitation is no longer pending");
        }

        collaboration.setStatus(CollaborationStatus.DECLINED);
        Collaboration saved = collaborationRepository.save(collaboration);

        // Publish invitation declined event
        eventPublisher.publishInvitationDeclined(saved);

        logger.info("Invitation {} declined successfully", invitationId);
        return collaborationMapper.toDTO(saved);
    }

    @Transactional
    public void revokeCollaboration(UUID collaborationId, UUID userId) {
        logger.info("User {} revoking collaboration {}", userId, collaborationId);

        Collaboration collaboration = collaborationRepository.findById(collaborationId)
                .orElseThrow(() -> new CollaborationException("Collaboration not found"));

        // Only the inviter can revoke
        if (!collaboration.getInviterId().equals(userId)) {
            throw new CollaborationException("Only the project owner can revoke collaboration");
        }

        collaboration.setStatus(CollaborationStatus.REVOKED);
        Collaboration saved = collaborationRepository.save(collaboration);

        // Publish collaboration revoked event
        eventPublisher.publishCollaborationRevoked(saved);

        logger.info("Collaboration {} revoked successfully", collaborationId);
    }

    public List<CollaborationDTO> getProjectCollaborators(UUID projectId) {
        logger.debug("Fetching collaborators for project {}", projectId);
        
        List<Collaboration> collaborations = collaborationRepository
                .findByProjectIdAndStatus(projectId, CollaborationStatus.ACCEPTED);
        
        return collaborations.stream()
                .map(collaborationMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<CollaborationDTO> getPendingInvitations(UUID userId) {
        logger.debug("Fetching pending invitations for user {}", userId);
        
        List<Collaboration> invitations = collaborationRepository
                .findByInviteeIdAndStatus(userId, CollaborationStatus.PENDING);
        
        // Filter out expired invitations
        return invitations.stream()
                .filter(inv -> !inv.isExpired())
                .map(collaborationMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<EnrichedInvitationDTO> getEnrichedPendingInvitations(UUID userId) {
        logger.debug("Fetching enriched pending invitations for user {}", userId);
        
        List<Collaboration> invitations = collaborationRepository
                .findByInviteeIdAndStatus(userId, CollaborationStatus.PENDING);
        
        // Filter out expired invitations and enrich with user/project data
        return invitations.stream()
                .filter(inv -> !inv.isExpired())
                .map(this::enrichInvitation)
                .collect(Collectors.toList());
    }

    private EnrichedInvitationDTO enrichInvitation(Collaboration collaboration) {
        EnrichedInvitationDTO dto = new EnrichedInvitationDTO();
        dto.setId(collaboration.getId());
        dto.setProjectId(collaboration.getProjectId());
        dto.setInviterId(collaboration.getInviterId());
        dto.setInviteeId(collaboration.getInviteeId());
        dto.setRole(collaboration.getRole());
        dto.setStatus(collaboration.getStatus());
        dto.setInvitedAt(collaboration.getInvitedAt());
        dto.setRespondedAt(collaboration.getRespondedAt());
        dto.setExpiresAt(collaboration.getExpiresAt());
        
        // Fetch user details
        UserServiceClient.UserInfo userInfo = userServiceClient.getUserInfo(collaboration.getInviterId());
        dto.setInviterUsername(userInfo.getUsername());
        dto.setInviterDisplayName(userInfo.getDisplayName());
        
        // Fetch project details
        ProjectServiceClient.ProjectInfo projectInfo = projectServiceClient.getProjectInfo(collaboration.getProjectId());
        dto.setProjectName(projectInfo.getName());
        dto.setProjectDescription(projectInfo.getDescription());
        
        return dto;
    }

    public List<CollaborationDTO> getSentInvitations(UUID userId) {
        logger.debug("Fetching sent invitations for user {}", userId);
        
        List<Collaboration> invitations = collaborationRepository.findByInviterId(userId);
        
        return invitations.stream()
                .map(collaborationMapper::toDTO)
                .collect(Collectors.toList());
    }

    public CollaborationDTO getCollaboration(UUID collaborationId) {
        logger.debug("Fetching collaboration {}", collaborationId);
        
        Collaboration collaboration = collaborationRepository.findById(collaborationId)
                .orElseThrow(() -> new CollaborationException("Collaboration not found"));
        
        return collaborationMapper.toDTO(collaboration);
    }

    public boolean hasPermission(UUID projectId, UUID userId, Permission permission) {
        return collaborationRepository.findByProjectIdAndInviteeIdAndStatus(
                projectId, userId, CollaborationStatus.ACCEPTED)
                .map(collab -> collab.hasPermission(permission))
                .orElse(false);
    }

    public boolean isProjectOwner(UUID projectId, UUID userId) {
        ProjectServiceClient.ProjectInfo projectInfo = projectServiceClient.getProjectInfo(projectId);
        return projectInfo.getOwnerId().equals(userId);
    }

    public List<UUID> getUserCollaboratedProjectIds(UUID userId) {
        logger.debug("Fetching collaborated project IDs for user {}", userId);
        
        List<Collaboration> collaborations = collaborationRepository
                .findByInviteeIdAndStatus(userId, CollaborationStatus.ACCEPTED);
        
        return collaborations.stream()
                .map(Collaboration::getProjectId)
                .collect(Collectors.toList());
    }

    public List<EnrichedCollaboratorDTO> getEnrichedProjectCollaborators(UUID projectId, UUID ownerId) {
        logger.debug("Fetching enriched collaborators for project {}", projectId);
        
        List<EnrichedCollaboratorDTO> result = new ArrayList<>();
        
        // Add project owner first if provided
        if (ownerId != null) {
            EnrichedCollaboratorDTO ownerDto = new EnrichedCollaboratorDTO();
            ownerDto.setProjectId(projectId);
            ownerDto.setInviteeId(ownerId);
            ownerDto.setRole(CollaborationRole.EDITOR); // Owner has full access
            ownerDto.setStatus(CollaborationStatus.ACCEPTED);
            
            UserServiceClient.UserInfo ownerInfo = userServiceClient.getUserInfo(ownerId);
            ownerDto.setInviteeUsername(ownerInfo.getUsername());
            ownerDto.setInviteeDisplayName(ownerInfo.getDisplayName());
            ownerDto.setInviteeProfileImageUrl(ownerInfo.getProfileImageUrl());
            
            result.add(ownerDto);
        }
        
        // Add collaborators
        List<Collaboration> collaborations = collaborationRepository
                .findByProjectIdAndStatus(projectId, CollaborationStatus.ACCEPTED);
        
        List<EnrichedCollaboratorDTO> collaboratorDtos = collaborations.stream()
                .map(this::enrichCollaborator)
                .collect(Collectors.toList());
        
        result.addAll(collaboratorDtos);
        
        return result;
    }

    private EnrichedCollaboratorDTO enrichCollaborator(Collaboration collaboration) {
        EnrichedCollaboratorDTO dto = new EnrichedCollaboratorDTO();
        dto.setId(collaboration.getId());
        dto.setProjectId(collaboration.getProjectId());
        dto.setInviterId(collaboration.getInviterId());
        dto.setInviteeId(collaboration.getInviteeId());
        dto.setRole(collaboration.getRole());
        dto.setStatus(collaboration.getStatus());
        dto.setInvitedAt(collaboration.getInvitedAt());
        dto.setRespondedAt(collaboration.getRespondedAt());
        dto.setCreatedAt(collaboration.getCreatedAt());
        
        // Fetch invitee user details
        UserServiceClient.UserInfo userInfo = userServiceClient.getUserInfo(collaboration.getInviteeId());
        dto.setInviteeUsername(userInfo.getUsername());
        dto.setInviteeDisplayName(userInfo.getDisplayName());
        dto.setInviteeProfileImageUrl(userInfo.getProfileImageUrl());
        
        return dto;
    }

    @Scheduled(cron = "0 0 * * * *") // Run every hour
    @Transactional
    public void cleanupExpiredInvitations() {
        logger.info("Running cleanup of expired invitations");
        
        List<Collaboration> expired = collaborationRepository
                .findExpiredInvitations(CollaborationStatus.PENDING, Instant.now());
        
        for (Collaboration collaboration : expired) {
            collaboration.setStatus(CollaborationStatus.DECLINED);
            collaborationRepository.save(collaboration);
            logger.debug("Expired invitation {} marked as declined", collaboration.getId());
        }
        
        logger.info("Cleaned up {} expired invitations", expired.size());
    }
}
