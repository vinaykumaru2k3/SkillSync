package com.skillsync.github.controller;

import com.skillsync.github.dto.GitHubRepositoryDTO;
import com.skillsync.github.entity.SyncStatus;
import com.skillsync.github.service.GitHubSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/github")
public class GitHubSyncController {
    
    private static final Logger logger = LoggerFactory.getLogger(GitHubSyncController.class);
    
    private final GitHubSyncService gitHubSyncService;
    
    public GitHubSyncController(GitHubSyncService gitHubSyncService) {
        this.gitHubSyncService = gitHubSyncService;
    }
    
    @PostMapping("/sync")
    public Mono<ResponseEntity<Map<String, Object>>> syncRepositories(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-GitHub-Token", required = false) String githubToken) {
        
        logger.info("Received sync request for user: {}", userId);
        
        // Extract access token - try GitHub token header first, then Authorization header
        String accessToken = null;
        if (githubToken != null && !githubToken.isEmpty()) {
            accessToken = githubToken;
        } else if (authHeader != null && !authHeader.isEmpty()) {
            accessToken = authHeader.replace("Bearer ", "");
        }
        
        // If no token provided, return error message
        if (accessToken == null || accessToken.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "GitHub token required");
            errorResponse.put("message", "Please connect your GitHub account first. You need to provide a GitHub personal access token.");
            errorResponse.put("instructions", "Go to GitHub Settings > Developer settings > Personal access tokens > Generate new token");
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse));
        }
        
        return gitHubSyncService.syncUserRepositories(userId, accessToken)
                .map(repositories -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("message", "Repositories synced successfully");
                    response.put("count", repositories.size());
                    response.put("repositories", repositories);
                    return ResponseEntity.ok(response);
                })
                .onErrorResume(error -> {
                    logger.error("Sync failed for user {}: {}", userId, error.getMessage());
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Sync failed");
                    errorResponse.put("message", error.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(errorResponse));
                });
    }
    
    @GetMapping("/repositories")
    public ResponseEntity<List<GitHubRepositoryDTO>> getUserRepositories(
            @RequestHeader("X-User-Id") String userId) {
        
        logger.debug("Fetching repositories for user: {}", userId);
        List<GitHubRepositoryDTO> repositories = gitHubSyncService.getUserRepositories(userId);
        return ResponseEntity.ok(repositories);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getLanguageStatistics(
            @RequestHeader("X-User-Id") String userId) {
        
        logger.debug("Fetching language statistics for user: {}", userId);
        
        Map<String, Integer> languageStats = gitHubSyncService.getLanguageStatistics(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("languages", languageStats);
        
        return ResponseEntity.ok(response);
    }
    
    // Keep the old endpoint for backward compatibility
    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<String, Object>> getLanguageStatisticsByPath(
            @PathVariable String userId) {
        
        logger.debug("Fetching language statistics for user (path param): {}", userId);
        
        Map<String, Integer> languageStats = gitHubSyncService.getLanguageStatistics(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("languages", languageStats);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/sync/status")
    public ResponseEntity<SyncStatus> getSyncStatus(@RequestHeader("X-User-Id") String userId) {
        logger.debug("Fetching sync status for user: {}", userId);
        
        SyncStatus status = gitHubSyncService.getSyncStatus(userId);
        if (status == null) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(status);
    }
}
