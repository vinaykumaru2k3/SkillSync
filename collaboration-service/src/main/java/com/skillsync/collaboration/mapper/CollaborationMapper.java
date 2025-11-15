package com.skillsync.collaboration.mapper;

import com.skillsync.collaboration.dto.CollaborationDTO;
import com.skillsync.collaboration.entity.Collaboration;
import org.springframework.stereotype.Component;

@Component
public class CollaborationMapper {

    public CollaborationDTO toDTO(Collaboration collaboration) {
        if (collaboration == null) {
            return null;
        }

        CollaborationDTO dto = new CollaborationDTO();
        dto.setId(collaboration.getId());
        dto.setProjectId(collaboration.getProjectId());
        dto.setInviterId(collaboration.getInviterId());
        dto.setInviteeId(collaboration.getInviteeId());
        dto.setRole(collaboration.getRole());
        dto.setStatus(collaboration.getStatus());
        dto.setPermissions(collaboration.getPermissions());
        dto.setInvitedAt(collaboration.getInvitedAt());
        dto.setRespondedAt(collaboration.getRespondedAt());
        dto.setExpiresAt(collaboration.getExpiresAt());
        dto.setCreatedAt(collaboration.getCreatedAt());
        dto.setUpdatedAt(collaboration.getUpdatedAt());

        return dto;
    }

    public Collaboration toEntity(CollaborationDTO dto) {
        if (dto == null) {
            return null;
        }

        Collaboration collaboration = new Collaboration();
        collaboration.setId(dto.getId());
        collaboration.setProjectId(dto.getProjectId());
        collaboration.setInviterId(dto.getInviterId());
        collaboration.setInviteeId(dto.getInviteeId());
        collaboration.setRole(dto.getRole());
        collaboration.setStatus(dto.getStatus());
        collaboration.setPermissions(dto.getPermissions());
        collaboration.setInvitedAt(dto.getInvitedAt());
        collaboration.setRespondedAt(dto.getRespondedAt());
        collaboration.setExpiresAt(dto.getExpiresAt());

        return collaboration;
    }
}
