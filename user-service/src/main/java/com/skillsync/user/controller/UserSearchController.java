package com.skillsync.user.controller;

import com.skillsync.user.dto.UserProfileDto;
import com.skillsync.user.dto.UserSearchRequest;
import com.skillsync.user.dto.UserSearchResponse;
import com.skillsync.user.entity.ProficiencyLevel;
import com.skillsync.user.service.UserSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users/search")
public class UserSearchController {

    private final UserSearchService userSearchService;

    public UserSearchController(UserSearchService userSearchService) {
        this.userSearchService = userSearchService;
    }

    @GetMapping
    public ResponseEntity<UserSearchResponse> searchProfiles(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "skills", required = false) List<String> skills,
            @RequestParam(value = "minProficiencyLevel", required = false) ProficiencyLevel minProficiencyLevel,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {

        UserSearchRequest request = new UserSearchRequest();
        request.setQuery(query);
        request.setSkills(skills);
        request.setMinProficiencyLevel(minProficiencyLevel);
        request.setLocation(location);
        request.setPage(page);
        request.setSize(size);

        UserSearchResponse response = userSearchService.searchProfiles(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/similar")
    public ResponseEntity<List<UserProfileDto>> findSimilarProfiles(
            @RequestParam(value = "skill") String skill,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        List<UserProfileDto> profiles = userSearchService.findSimilarProfiles(skill, limit);
        return ResponseEntity.ok(profiles);
    }
}
