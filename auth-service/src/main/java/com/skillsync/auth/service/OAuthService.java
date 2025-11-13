package com.skillsync.auth.service;

import com.skillsync.auth.dto.AuthResponse;
import com.skillsync.auth.entity.User;
import com.skillsync.auth.repository.UserRepository;
import com.skillsync.auth.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OAuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(OAuthService.class);
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    
    @Value("${jwt.expiration}")
    private Long jwtExpiration;
    
    public OAuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }
    
    /**
     * Process OAuth authentication from GitHub
     */
    @Transactional
    public AuthResponse processOAuthLogin(OAuth2User oAuth2User, String provider) {
        logger.info("Processing OAuth login for provider: {}", provider);
        
        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("Email not provided by OAuth provider");
        }
        
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;
        
        if (existingUser.isPresent()) {
            user = existingUser.get();
            user.addOauthProvider(provider);
            logger.info("Existing user found, adding OAuth provider: {}", provider);
        } else {
            user = new User();
            user.setEmail(email);
            user.addOauthProvider(provider);
            user.setIsActive(true);
            logger.info("Creating new user from OAuth: {}", email);
        }
        
        user.setLastLoginAt(LocalDateTime.now());
        user = userRepository.save(user);
        
        logger.info("OAuth login successful for user: {}", user.getId());
        return generateAuthResponse(user);
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
