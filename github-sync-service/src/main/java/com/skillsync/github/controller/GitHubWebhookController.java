package com.skillsync.github.controller;

import com.skillsync.github.dto.GitHubWebhookEvent;
import com.skillsync.github.service.GitHubWebhookService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/github/webhook")
public class GitHubWebhookController {
    
    private static final Logger logger = LoggerFactory.getLogger(GitHubWebhookController.class);
    
    private final GitHubWebhookService webhookService;
    
    public GitHubWebhookController(GitHubWebhookService webhookService) {
        this.webhookService = webhookService;
    }
    
    @PostMapping
    public ResponseEntity<Map<String, String>> handleWebhook(
            @RequestHeader(value = "X-GitHub-Event", required = false) String eventType,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody GitHubWebhookEvent event) {
        
        logger.info("Received GitHub webhook: event={}, userId={}", eventType, userId);
        
        if (eventType == null || eventType.isEmpty()) {
            logger.warn("Missing X-GitHub-Event header");
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Missing X-GitHub-Event header");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        if (userId == null || userId.isEmpty()) {
            logger.warn("Missing X-User-Id header");
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Missing X-User-Id header");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        try {
            webhookService.processRepositoryEvent(eventType, event, userId);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Webhook processed successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error processing webhook: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Webhook processing failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        return ResponseEntity.ok(response);
    }
}
