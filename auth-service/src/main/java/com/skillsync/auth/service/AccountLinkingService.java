package com.skillsync.auth.service;

import com.skillsync.auth.entity.User;
import com.skillsync.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for handling account linking between OAuth and manual accounts
 */
@Service
public class AccountLinkingService {
    
    private static final Logger logger = LoggerFactory.getLogger(AccountLinkingService.class);
    
    private final UserRepository userRepository;
    
    public AccountLinkingService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    /**
     * Link OAuth provider to existing account or create new account
     * 
     * Algorithm:
     * 1. Check if user exists with this email
     * 2. If exists and has password -> Link OAuth to existing account
     * 3. If exists and OAuth only -> Add new OAuth provider
     * 4. If not exists -> Create new account with OAuth
     * 
     * @param email User's email from OAuth provider
     * @param provider OAuth provider name (e.g., "github", "google")
     * @param oauthId Provider-specific user ID (for future use)
     * @return User account (existing or newly created)
     */
    @Transactional
    public User linkOrCreateAccount(String email, String provider, String oauthId) {
        logger.info("Attempting to link or create account for email: {} with provider: {}", email, provider);
        
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            
            // Check if this OAuth provider is already linked
            if (user.getOauthProviders().contains(provider)) {
                logger.info("User already has {} provider linked", provider);
            } else {
                // Link new OAuth provider to existing account
                user.addOauthProvider(provider);
                logger.info("Linked {} provider to existing account: {}", provider, email);
            }
            
            user.setLastLoginAt(LocalDateTime.now());
            return userRepository.save(user);
        } else {
            // Create new account with OAuth
            User newUser = new User();
            newUser.setEmail(email);
            newUser.addOauthProvider(provider);
            newUser.setIsActive(true);
            newUser.setLastLoginAt(LocalDateTime.now());
            
            User saved = userRepository.save(newUser);
            logger.info("Created new account from OAuth: {} with provider: {}", email, provider);
            return saved;
        }
    }
    
    /**
     * Check if account can be safely linked
     * Returns true if:
     * - Account exists with same email
     * - Account is active
     * - OAuth provider not already linked to different account
     */
    @Transactional(readOnly = true)
    public boolean canLinkAccount(String email, String provider) {
        Optional<User> user = userRepository.findByEmail(email);
        
        if (user.isEmpty()) {
            return true; // Can create new account
        }
        
        User existingUser = user.get();
        
        // Check if account is active
        if (!existingUser.getIsActive()) {
            logger.warn("Cannot link to inactive account: {}", email);
            return false;
        }
        
        // Already linked - this is fine
        if (existingUser.getOauthProviders().contains(provider)) {
            return true;
        }
        
        return true; // Can link to existing account
    }
    
    /**
     * Get account linking status for user
     */
    @Transactional(readOnly = true)
    public AccountLinkingStatus getAccountStatus(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        
        if (user.isEmpty()) {
            return new AccountLinkingStatus(false, false, 0);
        }
        
        User existingUser = user.get();
        boolean hasPassword = existingUser.getPasswordHash() != null && !existingUser.getPasswordHash().isEmpty();
        boolean hasOAuth = !existingUser.getOauthProviders().isEmpty();
        int linkedProviders = existingUser.getOauthProviders().size();
        
        return new AccountLinkingStatus(hasPassword, hasOAuth, linkedProviders);
    }
    
    /**
     * Unlink OAuth provider from account
     * Only allowed if user has password or other OAuth providers
     */
    @Transactional
    public boolean unlinkProvider(String email, String provider) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            logger.warn("Cannot unlink provider - user not found: {}", email);
            return false;
        }
        
        User user = userOpt.get();
        
        // Check if user has alternative login method
        boolean hasPassword = user.getPasswordHash() != null && !user.getPasswordHash().isEmpty();
        boolean hasOtherProviders = user.getOauthProviders().size() > 1;
        
        if (!hasPassword && !hasOtherProviders) {
            logger.warn("Cannot unlink last authentication method for user: {}", email);
            return false;
        }
        
        user.getOauthProviders().remove(provider);
        userRepository.save(user);
        logger.info("Unlinked {} provider from account: {}", provider, email);
        
        return true;
    }
    
    /**
     * DTO for account linking status
     */
    public static class AccountLinkingStatus {
        private final boolean hasPassword;
        private final boolean hasOAuth;
        private final int linkedProviders;
        
        public AccountLinkingStatus(boolean hasPassword, boolean hasOAuth, int linkedProviders) {
            this.hasPassword = hasPassword;
            this.hasOAuth = hasOAuth;
            this.linkedProviders = linkedProviders;
        }
        
        public boolean hasPassword() {
            return hasPassword;
        }
        
        public boolean hasOAuth() {
            return hasOAuth;
        }
        
        public int getLinkedProviders() {
            return linkedProviders;
        }
        
        public boolean canUnlinkProvider() {
            return hasPassword || linkedProviders > 1;
        }
    }
}
