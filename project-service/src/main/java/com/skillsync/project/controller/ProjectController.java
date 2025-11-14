package com.skillsync.project.controller;

import com.skillsync.project.dto.ProjectRequest;
import com.skillsync.project.dto.ProjectResponse;
import com.skillsync.project.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Slf4j
public class ProjectController {
    
    private final ProjectService projectService;
    
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId,
            @Valid @RequestBody ProjectRequest request) {
        // For now, use a default user ID if not provided (since endpoints are public for development)
        if (userId == null) {
            userId = UUID.fromString("5c845ec6-90d7-4429-a0fa-cf06ea01b4de"); // Default user ID
        }
        log.info("Creating project for user: {}", userId);
        ProjectResponse response = projectService.createProject(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable("projectId") UUID projectId) {
        log.info("Fetching project: {}", projectId);
        ProjectResponse response = projectService.getProject(projectId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByOwner(@PathVariable("ownerId") UUID ownerId) {
        log.info("Fetching projects for owner: {}", ownerId);
        List<ProjectResponse> projects = projectService.getProjectsByOwner(ownerId);
        return ResponseEntity.ok(projects);
    }
    
    @GetMapping("/public")
    public ResponseEntity<List<ProjectResponse>> getAllPublicProjects() {
        log.info("Fetching all public projects");
        List<ProjectResponse> projects = projectService.getAllPublicProjects();
        return ResponseEntity.ok(projects);
    }
    
    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable("projectId") UUID projectId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId,
            @Valid @RequestBody ProjectRequest request) {
        // For now, use a default user ID if not provided
        if (userId == null) {
            userId = UUID.fromString("5c845ec6-90d7-4429-a0fa-cf06ea01b4de");
        }
        log.info("Updating project: {}", projectId);
        ProjectResponse response = projectService.updateProject(projectId, userId, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable("projectId") UUID projectId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        // For now, use a default user ID if not provided
        if (userId == null) {
            userId = UUID.fromString("5c845ec6-90d7-4429-a0fa-cf06ea01b4de");
        }
        log.info("Deleting project: {}", projectId);
        projectService.deleteProject(projectId, userId);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<ProjectResponse>> searchProjects(
            @RequestParam(value = "searchTerm", required = false) String searchTerm,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "technologies", required = false) List<String> technologies) {
        log.info("Searching projects with term: {}, tags: {}, technologies: {}", searchTerm, tags, technologies);
        List<ProjectResponse> projects = projectService.searchProjects(
                searchTerm,
                tags != null ? Set.copyOf(tags) : null,
                technologies != null ? Set.copyOf(technologies) : null
        );
        return ResponseEntity.ok(projects);
    }
    
    @GetMapping("/discover")
    public ResponseEntity<List<ProjectResponse>> discoverProjects() {
        log.info("Discovering projects");
        List<ProjectResponse> projects = projectService.discoverProjects();
        return ResponseEntity.ok(projects);
    }
}
