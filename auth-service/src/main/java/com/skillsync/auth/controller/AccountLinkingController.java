package com.skillsync.auth.controller;

import com.skillsync.auth.entity.User;
import com.skillsync.auth.repository.UserRepository;
import com.skillsync.auth.service.AccountLinkingService;
import com.skillsync.auth.service.AccountLinkingService.AccountLinkingStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for managing account linking
 */
@RestController
@RequestMapping("/api/v1/auth/account")
public class AccountLinkingController {
    
    private static final Logger logger = LoggerFactory.getLogger(AccountLinkingController.class);
    
    private final AccountLinkingService accountLinkingService;
    private final UserRepository userRepository;
    
    public AccountLinkingController(AccountLinkingService accountLinkingService,
                                   UserRepository userRepository) {
        this.accountLinkingService = accountLinkingService;
        this.userRepository = userRepository;
    }
    
    /**
     * Get current user's linked accounts status
     */
    @GetMapping("/linked-providers")
    public ResponseEntity<?> getLinkedProviders(Authentication authentication) {
        try {
            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            AccountLinkingStatus status = accountLinkingService.getAccountStatus(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("email", user.getEmail());
            response.put("hasPassword", status.hasPassword());
            response.put("hasOAuth", status.hasOAuth());
            response.put("linkedProviders", user.getOauthProviders());
            response.put("canUnlinkProvider", status.canUnlinkProvider());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting linked providers", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to get linked providers"));
        }
    }
    
    /**
     * Unlink OAuth provider from account
     */
    @DeleteMapping("/unlink/{provider}")
    public ResponseEntity<?> unlinkProvider(
            @PathVariable String provider,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            
            boolean success = accountLinkingService.unlinkProvider(email, provider);
            
            if (success) {
                return ResponseEntity.ok(Map.of(
                    "message", "Provider unlinked successfully",
                    "provider", provider
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Cannot unlink last authentication method"
                ));
            }
        } catch (Exception e) {
            logger.error("Error unlinking provider", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to unlink provider"));
        }
    }
}
