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

        if (userProfileRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        }

        UserProfile profile = new UserProfile();
        profile.setUserId(request.getUserId());
        profile.setUsername(request.getUsername());
        profile.setDisplayName(request.getDisplayName());
        profile.setBio(request.getBio());
        profile.setLocation(request.getLocation());
        profile.setWebsite(request.getWebsite());
        profile.setVisibility(request.getVisibility());
        profile.setSocialLinks(request.getSocialLinks());

        UserProfile saved = userProfileRepository.save(profile);
        return mapper.toDto(saved);
    }

    public void createDefaultProfile(UUID userId) {
        if (userProfileRepository.existsByUserId(userId)) {
            return;
        }

        UserProfile profile = new UserProfile();
        profile.setUserId(userId);
        // Set default username as user-{uuid-prefix}
        String defaultUsername = "user-" + userId.toString().substring(0, 8);
        // Ensure uniqueness in case of collision (unlikely with UUID prefix but
        // possible if user changes it back)
        int counter = 1;
        while (userProfileRepository.existsByUsername(defaultUsername)) {
            defaultUsername = "user-" + userId.toString().substring(0, 8) + "-" + counter++;
        }

        profile.setUsername(defaultUsername);
        profile.setDisplayName("New User");
        profile.setVisibility(com.skillsync.user.entity.Visibility.PUBLIC); // Public by default

        userProfileRepository.save(profile);
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

    @Transactional(readOnly = true)
    public UserProfileDto getProfileByUsername(String username) {
        UserProfile profile = userProfileRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for username: " + username));
        return mapper.toDto(profile);
    }

    public UserProfileDto updateProfile(UUID profileId, UpdateUserProfileRequest request) {
        UserProfile profile = userProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found: " + profileId));

        if (request.getUsername() != null) {
            if (userProfileRepository.existsByUsername(request.getUsername()) &&
                    !request.getUsername().equals(profile.getUsername())) {
                throw new DuplicateResourceException("Username already taken: " + request.getUsername());
            }
            profile.setUsername(request.getUsername());
        }
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
