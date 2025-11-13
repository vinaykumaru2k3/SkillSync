package com.skillsync.user.service;

import com.skillsync.user.dto.CreateUserProfileRequest;
import com.skillsync.user.dto.SkillCardDto;
import com.skillsync.user.dto.UpdateUserProfileRequest;
import com.skillsync.user.dto.UserProfileDto;
import com.skillsync.user.entity.SkillCard;
import com.skillsync.user.entity.UserProfile;
import com.skillsync.user.exception.DuplicateResourceException;
import com.skillsync.user.exception.ResourceNotFoundException;
import com.skillsync.user.mapper.UserProfileMapper;
import com.skillsync.user.repository.SkillCardRepository;
import com.skillsync.user.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final SkillCardRepository skillCardRepository;
    private final UserProfileMapper mapper;

    public UserProfileService(UserProfileRepository userProfileRepository,
                              SkillCardRepository skillCardRepository,
                              UserProfileMapper mapper) {
        this.userProfileRepository = userProfileRepository;
        this.skillCardRepository = skillCardRepository;
        this.mapper = mapper;
    }

    public UserProfileDto createProfile(CreateUserProfileRequest request) {
        if (userProfileRepository.existsByUserId(request.getUserId())) {
            throw new DuplicateResourceException("Profile already exists for user: " + request.getUserId());
        }

        UserProfile profile = new UserProfile();
        profile.setUserId(request.getUserId());
        profile.setDisplayName(request.getDisplayName());
        profile.setBio(request.getBio());
        profile.setLocation(request.getLocation());
        profile.setWebsite(request.getWebsite());
        profile.setVisibility(request.getVisibility());
        profile.setSocialLinks(request.getSocialLinks());

        UserProfile saved = userProfileRepository.save(profile);
        return mapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfileById(UUID profileId) {
        UserProfile profile = userProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found: " + profileId));
        return mapper.toDto(profile);
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfileByUserId(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));
        return mapper.toDto(profile);
    }

    public UserProfileDto updateProfile(UUID profileId, UpdateUserProfileRequest request) {
        UserProfile profile = userProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found: " + profileId));

        if (request.getDisplayName() != null) {
            profile.setDisplayName(request.getDisplayName());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getLocation() != null) {
            profile.setLocation(request.getLocation());
        }
        if (request.getWebsite() != null) {
            profile.setWebsite(request.getWebsite());
        }
        if (request.getVisibility() != null) {
            profile.setVisibility(request.getVisibility());
        }
        if (request.getSocialLinks() != null) {
            profile.setSocialLinks(request.getSocialLinks());
        }
        if (request.getProfileImageUrl() != null) {
            profile.setProfileImageUrl(request.getProfileImageUrl());
        }

        UserProfile updated = userProfileRepository.save(profile);
        return mapper.toDto(updated);
    }

    public void deleteProfile(UUID profileId) {
        if (!userProfileRepository.existsById(profileId)) {
            throw new ResourceNotFoundException("Profile not found: " + profileId);
        }
        userProfileRepository.deleteById(profileId);
    }

    public SkillCardDto addSkill(UUID profileId, SkillCardDto skillDto) {
        UserProfile profile = userProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found: " + profileId));

        SkillCard skill = mapper.dtoToSkill(skillDto);
        profile.addSkill(skill);
        userProfileRepository.save(profile);

        return mapper.skillToDto(skill);
    }

    public SkillCardDto updateSkill(UUID profileId, UUID skillId, SkillCardDto skillDto) {
        SkillCard skill = skillCardRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + skillId));

        if (!skill.getUserProfile().getId().equals(profileId)) {
            throw new ResourceNotFoundException("Skill does not belong to profile: " + profileId);
        }

        skill.setName(skillDto.getName());
        skill.setProficiencyLevel(skillDto.getProficiencyLevel());
        skill.setYearsOfExperience(skillDto.getYearsOfExperience());

        SkillCard updated = skillCardRepository.save(skill);
        return mapper.skillToDto(updated);
    }

    public void deleteSkill(UUID profileId, UUID skillId) {
        SkillCard skill = skillCardRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + skillId));

        if (!skill.getUserProfile().getId().equals(profileId)) {
            throw new ResourceNotFoundException("Skill does not belong to profile: " + profileId);
        }

        skillCardRepository.delete(skill);
    }

    public void updateProfileImage(UUID profileId, String imageUrl) {
        UserProfile profile = userProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found: " + profileId));

        profile.setProfileImageUrl(imageUrl);
        userProfileRepository.save(profile);
    }
}
