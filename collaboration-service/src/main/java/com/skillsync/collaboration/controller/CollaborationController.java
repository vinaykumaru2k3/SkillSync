package com.skillsync.collaboration.controller;

import com.skillsync.collaboration.dto.CollaborationDTO;
import com.skillsync.collaboration.dto.EnrichedInvitationDTO;
import com.skillsync.collaboration.dto.InvitationRequest;
import com.skillsync.collaboration.dto.InvitationResponse;
import com.skillsync.collaboration.service.CollaborationService;
import com.skillsync.shared.dto.ApiResponse;
import com.skillsync.shared.security.JwtUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/collaborations")
public class CollaborationController {

    private static final Logger logger = LoggerFactory.getLogger(CollaborationController.class);

    @Autowired
    private CollaborationService collaborationService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/invites")
    public ResponseEntity<ApiResponse<InvitationResponse>> createInvitation(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody InvitationRequest request) {
        
        UUID inviterId = UUID.fromString(userId);
        logger.info("Creating invitation from user {}", inviterId);

        CollaborationDTO collaboration = collaborationService.createInvitation(inviterId, request);
        InvitationResponse response = new InvitationResponse(
                "Invitation sent successfully", collaboration);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Invitation created", response));
    }

    @PostMapping("/invites/{id}/accept")
    public ResponseEntity<ApiResponse<InvitationResponse>> acceptInvitation(
            @RequestHeader("X-User-Id") String userIdStr,
            @PathVariable UUID id) {
        
        UUID userId = UUID.fromString(userIdStr);
        logger.info("User {} accepting invitation {}", userId, id);

        CollaborationDTO collaboration = collaborationService.acceptInvitation(id, userId);
        InvitationResponse response = new InvitationResponse(
                "Invitation accepted successfully", collaboration);

        return ResponseEntity.ok(ApiResponse.success("Invitation accepted", response));
    }

    @PostMapping("/invites/{id}/decline")
    public ResponseEntity<ApiResponse<InvitationResponse>> declineInvitation(
            @RequestHeader("X-User-Id") String userIdStr,
            @PathVariable UUID id) {
        
        UUID userId = UUID.fromString(userIdStr);
        logger.info("User {} declining invitation {}", userId, id);

        CollaborationDTO collaboration = collaborationService.declineInvitation(id, userId);
        InvitationResponse response = new InvitationResponse(
                "Invitation declined", collaboration);

        return ResponseEntity.ok(ApiResponse.success("Invitation declined", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> revokeCollaboration(
            @RequestHeader("X-User-Id") String userIdStr,
            @PathVariable UUID id) {
        
        UUID userId = UUID.fromString(userIdStr);
        logger.info("User {} revoking collaboration {}", userId, id);

        collaborationService.revokeCollaboration(id, userId);

        return ResponseEntity.ok(ApiResponse.success("Collaboration revoked", null));
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<List<CollaborationDTO>>> getProjectCollaborators(
            @PathVariable UUID projectId) {
        
        logger.info("Fetching collaborators for project {}", projectId);

        List<CollaborationDTO> collaborators = collaborationService.getProjectCollaborators(projectId);

        return ResponseEntity.ok(ApiResponse.success(collaborators));
    }

    @GetMapping("/invites/pending")
    public ResponseEntity<ApiResponse<List<CollaborationDTO>>> getPendingInvitations(
            @RequestHeader("X-User-Id") String userIdStr) {
        
        UUID userId = UUID.fromString(userIdStr);
        logger.info("Fetching pending invitations for user {}", userId);

        List<CollaborationDTO> invitations = collaborationService.getPendingInvitations(userId);

        return ResponseEntity.ok(ApiResponse.success(invitations));
    }

    @GetMapping("/invites/pending/enriched")
    public ResponseEntity<ApiResponse<List<EnrichedInvitationDTO>>> getEnrichedPendingInvitations(
            @RequestHeader("X-User-Id") String userIdStr) {
        
        UUID userId = UUID.fromString(userIdStr);
        logger.info("Fetching enriched pending invitations for user {}", userId);

        List<EnrichedInvitationDTO> invitations = collaborationService.getEnrichedPendingInvitations(userId);

        return ResponseEntity.ok(ApiResponse.success(invitations));
    }

    @GetMapping("/invites/sent")
    public ResponseEntity<ApiResponse<List<CollaborationDTO>>> getSentInvitations(
            @RequestHeader("X-User-Id") String userIdStr) {
        
        UUID userId = UUID.fromString(userIdStr);
        logger.info("Fetching sent invitations for user {}", userId);

        List<CollaborationDTO> invitations = collaborationService.getSentInvitations(userId);

        return ResponseEntity.ok(ApiResponse.success(invitations));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CollaborationDTO>> getCollaboration(
            @PathVariable UUID id) {
        
        logger.info("Fetching collaboration {}", id);

        CollaborationDTO collaboration = collaborationService.getCollaboration(id);

        return ResponseEntity.ok(ApiResponse.success(collaboration));
    }

    @GetMapping("/projects/{projectId}/permissions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkPermissions(
            @RequestHeader("X-User-Id") String userIdStr,
            @PathVariable UUID projectId) {
        
        UUID userId = UUID.fromString(userIdStr);
        logger.info("Checking permissions for user {} on project {}", userId, projectId);

        boolean isCollaborator = collaborationService.hasPermission(
                projectId, userId, com.skillsync.collaboration.entity.Permission.READ);
        
        Map<String, Object> permissions = new HashMap<>();
        permissions.put("isCollaborator", isCollaborator);
        permissions.put("canRead", collaborationService.hasPermission(
                projectId, userId, com.skillsync.collaboration.entity.Permission.READ));
        permissions.put("canWrite", collaborationService.hasPermission(
                projectId, userId, com.skillsync.collaboration.entity.Permission.WRITE));
        permissions.put("canDelete", collaborationService.hasPermission(
                projectId, userId, com.skillsync.collaboration.entity.Permission.DELETE));

        return ResponseEntity.ok(ApiResponse.success(permissions));
    }

}
