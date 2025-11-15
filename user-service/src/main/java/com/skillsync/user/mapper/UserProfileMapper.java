package com.skillsync.user.mapper;

import com.skillsync.user.dto.SkillCardDto;
import com.skillsync.user.dto.UserProfileDto;
import com.skillsync.user.entity.SkillCard;
import com.skillsync.user.entity.UserProfile;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserProfileMapper {

    public UserProfileDto toDto(UserProfile entity) {
        if (entity == null) {
            return null;
        }

        UserProfileDto dto = new UserProfileDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setUsername(entity.getUsername());
        dto.setDisplayName(entity.getDisplayName());
        dto.setBio(entity.getBio());
        dto.setLocation(entity.getLocation());
        dto.setWebsite(entity.getWebsite());
        dto.setProfileImageUrl(entity.getProfileImageUrl());
        dto.setVisibility(entity.getVisibility());
        dto.setSocialLinks(entity.getSocialLinks());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getSkills() != null) {
            dto.setSkills(entity.getSkills().stream()
                    .map(this::skillToDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public SkillCardDto skillToDto(SkillCard entity) {
        if (entity == null) {
            return null;
        }

        return new SkillCardDto(
                entity.getId(),
                entity.getName(),
                entity.getProficiencyLevel(),
                entity.getYearsOfExperience()
        );
    }

    public SkillCard dtoToSkill(SkillCardDto dto) {
        if (dto == null) {
            return null;
        }

        SkillCard skill = new SkillCard();
        skill.setId(dto.getId());
        skill.setName(dto.getName());
        skill.setProficiencyLevel(dto.getProficiencyLevel());
        skill.setYearsOfExperience(dto.getYearsOfExperience());

        return skill;
    }
}
