package com.skillsync.user.controller;

import com.skillsync.user.dto.CreateUserProfileRequest;
import com.skillsync.user.dto.SkillCardDto;
import com.skillsync.user.dto.UpdateUserProfileRequest;
import com.skillsync.user.dto.UserProfileDto;
import com.skillsync.user.service.SimpleFileStorageService;
import com.skillsync.user.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserProfileController {

    private final UserProfileService userProfileService;
    private final SimpleFileStorageService fileStorageService;

    public UserProfileController(UserProfileService userProfileService,
                                 SimpleFileStorageService fileStorageService) {
        this.userProfileService = userProfileService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping
    public ResponseEntity<UserProfileDto> createProfile(@Valid @RequestBody CreateUserProfileRequest request) {
        UserProfileDto profile = userProfileService.createProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(profile);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDto> getProfile(@PathVariable("id") UUID id) {
        UserProfileDto profile = userProfileService.getProfileById(id);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserProfileDto> getProfileByUserId(@PathVariable("userId") UUID userId) {
        UserProfileDto profile = userProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfileDto> updateProfile(
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateUserProfileRequest request) {
        UserProfileDto profile = userProfileService.updateProfile(id, request);
        return ResponseEntity.ok(profile);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(@PathVariable("id") UUID id) {
        userProfileService.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/skills")
    public ResponseEntity<SkillCardDto> addSkill(
            @PathVariable("id") UUID id,
            @Valid @RequestBody SkillCardDto skillDto) {
        SkillCardDto skill = userProfileService.addSkill(id, skillDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(skill);
    }

    @PutMapping("/{id}/skills/{skillId}")
    public ResponseEntity<SkillCardDto> updateSkill(
            @PathVariable("id") UUID id,
            @PathVariable("skillId") UUID skillId,
            @Valid @RequestBody SkillCardDto skillDto) {
        SkillCardDto skill = userProfileService.updateSkill(id, skillId, skillDto);
        return ResponseEntity.ok(skill);
    }

    @DeleteMapping("/{id}/skills/{skillId}")
    public ResponseEntity<Void> deleteSkill(
            @PathVariable("id") UUID id,
            @PathVariable("skillId") UUID skillId) {
        userProfileService.deleteSkill(id, skillId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<String> uploadAvatar(
            @PathVariable("id") UUID id,
            @RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = fileStorageService.storeFile(file);
            userProfileService.updateProfileImage(id, fileUrl);
            return ResponseEntity.ok(fileUrl);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }
}
