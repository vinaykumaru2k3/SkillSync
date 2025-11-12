package com.skillsync.gateway.fallback;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/auth-service")
    public ResponseEntity<Map<String, Object>> authServiceFallback() {
        return createFallbackResponse("Authentication service is temporarily unavailable. Please try again later.");
    }

    @PostMapping("/auth-service")
    public ResponseEntity<Map<String, Object>> authServicePostFallback() {
        return createFallbackResponse("Authentication service is temporarily unavailable. Please try again later.");
    }

    @GetMapping("/user-service")
    public ResponseEntity<Map<String, Object>> userServiceFallback() {
        return createFallbackResponse("User service is temporarily unavailable. Please try again later.");
    }

    @PostMapping("/user-service")
    public ResponseEntity<Map<String, Object>> userServicePostFallback() {
        return createFallbackResponse("User service is temporarily unavailable. Please try again later.");
    }

    @GetMapping("/project-service")
    public ResponseEntity<Map<String, Object>> projectServiceFallback() {
        return createFallbackResponse("Project service is temporarily unavailable. Please try again later.");
    }

    @PostMapping("/project-service")
    public ResponseEntity<Map<String, Object>> projectServicePostFallback() {
        return createFallbackResponse("Project service is temporarily unavailable. Please try again later.");
    }

    @GetMapping("/github-service")
    public ResponseEntity<Map<String, Object>> githubServiceFallback() {
        return createFallbackResponse("GitHub sync service is temporarily unavailable. Please try again later.");
    }

    @PostMapping("/github-service")
    public ResponseEntity<Map<String, Object>> githubServicePostFallback() {
        return createFallbackResponse("GitHub sync service is temporarily unavailable. Please try again later.");
    }

    @GetMapping("/collaboration-service")
    public ResponseEntity<Map<String, Object>> collaborationServiceFallback() {
        return createFallbackResponse("Collaboration service is temporarily unavailable. Please try again later.");
    }

    @PostMapping("/collaboration-service")
    public ResponseEntity<Map<String, Object>> collaborationServicePostFallback() {
        return createFallbackResponse("Collaboration service is temporarily unavailable. Please try again later.");
    }

    @GetMapping("/feedback-service")
    public ResponseEntity<Map<String, Object>> feedbackServiceFallback() {
        return createFallbackResponse("Feedback service is temporarily unavailable. Please try again later.");
    }

    @PostMapping("/feedback-service")
    public ResponseEntity<Map<String, Object>> feedbackServicePostFallback() {
        return createFallbackResponse("Feedback service is temporarily unavailable. Please try again later.");
    }

    @GetMapping("/notification-service")
    public ResponseEntity<Map<String, Object>> notificationServiceFallback() {
        return createFallbackResponse("Notification service is temporarily unavailable. Please try again later.");
    }

    @PostMapping("/notification-service")
    public ResponseEntity<Map<String, Object>> notificationServicePostFallback() {
        return createFallbackResponse("Notification service is temporarily unavailable. Please try again later.");
    }

    private ResponseEntity<Map<String, Object>> createFallbackResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "SERVICE_UNAVAILABLE");
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}