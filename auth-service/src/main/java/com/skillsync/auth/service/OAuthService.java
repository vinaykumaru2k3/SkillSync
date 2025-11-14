package com.skillsync.auth.service;

import com.skillsync.auth.dto.AuthResponse;
import com.skillsync.auth.entity.User;
import com.skillsync.auth.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OAuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(OAuthService.class);
    
    private final JwtUtil jwtUtil;
    private final AccountLinkingService accountLinkingService;
    
    @Value("${jwt.expiration}")
    private Long jwtExpiration;
    
    public OAuthService(JwtUtil jwtUtil,
                       AccountLinkingService accountLinkingService) {
        this.jwtUtil = jwtUtil;
        this.accountLinkingService = accountLinkingService;
    }
    
    /**
     * Process OAuth authentication from GitHub
     * Uses AccountLinkingService to safely link or create accounts
     */
    @Transactional
    public AuthResponse processOAuthLogin(OAuth2User oAuth2User, String provider) {
        logger.info("Processing OAuth login for provider: {}", provider);
        logger.info("OAuth user attributes: {}", oAuth2User.getAttributes());
        
        String email = extractEmail(oAuth2User, provider);
        String oauthId = extractOAuthId(oAuth2User, provider);
        
        // Validate email
        if (email == null || email.isEmpty()) {
            logger.error("Email extraction failed for provider: {}", provider);
            throw new IllegalArgumentException("Email not provided by OAuth provider. Please make your email public in your " + provider + " settings.");
        }
        
        // Check if account can be linked
        if (!accountLinkingService.canLinkAccount(email, provider)) {
            logger.error("Cannot link account for email: {} with provider: {}", email, provider);
            throw new IllegalArgumentException("Cannot link account. Please contact support.");
        }
        
        // Link or create account
        User user = accountLinkingService.linkOrCreateAccount(email, provider, oauthId);
        
        logger.info("OAuth login successful for user: {} (email: {}, provider: {})", 
                   user.getId(), email, provider);
        
        return generateAuthResponse(user);
    }
    
    /**
     * Extract email from OAuth provider
     */
    private String extractEmail(OAuth2User oAuth2User, String provider) {
        String email = oAuth2User.getAttribute("email");
        
        // GitHub-specific: try to get email from emails list
        if ((email == null || email.isEmpty()) && "github".equalsIgnoreCase(provider)) {
            // GitHub may not include email in user object, but it's available in the attributes
            // Spring Security OAuth2 should fetch it with user:email scope
            Object emailsObj = oAuth2User.getAttributes().get("email");
            if (emailsObj != null) {
                email = emailsObj.toString();
            }
            
            // Last resort fallback
            if (email == null || email.isEmpty()) {
                String login = oAuth2User.getAttribute("login");
                if (login != null && !login.isEmpty()) {
                    email = login + "@github.user";
                    logger.warn("GitHub email not available, using fallback: {}", email);
                    logger.warn("Please make your email public in GitHub settings or grant email access");
                }
            }
        }
        
        return email;
    }
    
    /**
     * Extract OAuth provider-specific user ID
     */
    private String extractOAuthId(OAuth2User oAuth2User, String provider) {
        Object id = oAuth2User.getAttribute("id");
        if (id != null) {
            return id.toString();
        }
        
        // GitHub uses "login" as username
        if ("github".equalsIgnoreCase(provider)) {
            String login = oAuth2User.getAttribute("login");
            if (login != null) {
                return login;
            }
        }
        
        return null;
    }
    
    /**
     * Generate authentication response with tokens
     */
    private AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRoles());
        String refreshToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRoles());
        
        return new AuthResponse(
            user.getId(),
            user.getEmail(),
            accessToken,
            refreshToken,
            user.getRoles(),
            jwtExpiration
        );
    }
}
