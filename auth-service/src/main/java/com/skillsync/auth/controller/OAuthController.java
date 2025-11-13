package com.skillsync.auth.controller;

import com.skillsync.auth.dto.AuthResponse;
import com.skillsync.auth.service.OAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth/oauth")
public class OAuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(OAuthController.class);
    
    private final OAuthService oAuthService;
    
    public OAuthController(OAuthService oAuthService) {
        this.oAuthService = oAuthService;
    }
    
    /**
     * GitHub OAuth callback handler
     */
    @GetMapping("/github/callback")
    public ResponseEntity<?> githubCallback(@AuthenticationPrincipal OAuth2User oAuth2User) {
        try {
            if (oAuth2User == null) {
                logger.error("OAuth2User is null");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("OAuth authentication failed"));
            }
            
            logger.info("GitHub OAuth callback received");
            AuthResponse response = oAuthService.processOAuthLogin(oAuth2User, "github");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("GitHub OAuth failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during GitHub OAuth", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("OAuth authentication failed"));
        }
    }
    
    /**
     * Initiate GitHub OAuth flow
     */
    @GetMapping("/github/login")
    public ResponseEntity<Map<String, String>> initiateGithubLogin() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Redirect to GitHub OAuth");
        response.put("url", "/oauth2/authorization/github");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Create error response
     */
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
