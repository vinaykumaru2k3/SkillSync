package com.skillsync.collaboration.repository;

import com.skillsync.collaboration.entity.Collaboration;
import com.skillsync.collaboration.entity.CollaborationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollaborationRepository extends JpaRepository<Collaboration, UUID> {

    List<Collaboration> findByProjectId(UUID projectId);

    List<Collaboration> findByProjectIdAndStatus(UUID projectId, CollaborationStatus status);

    List<Collaboration> findByInviteeIdAndStatus(UUID inviteeId, CollaborationStatus status);

    List<Collaboration> findByInviterId(UUID inviterId);

    Optional<Collaboration> findByProjectIdAndInviteeIdAndStatus(
            UUID projectId, UUID inviteeId, CollaborationStatus status);

    @Query("SELECT c FROM Collaboration c WHERE c.status = :status AND c.expiresAt < :now")
    List<Collaboration> findExpiredInvitations(@Param("status") CollaborationStatus status, @Param("now") Instant now);

    boolean existsByProjectIdAndInviteeIdAndStatus(UUID projectId, UUID inviteeId, CollaborationStatus status);
}
