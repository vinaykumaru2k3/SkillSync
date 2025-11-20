package com.skillsync.auth.service;

import com.skillsync.auth.dto.AuthResponse;
import com.skillsync.auth.dto.LoginRequest;
import com.skillsync.auth.dto.RegisterRequest;
import com.skillsync.auth.entity.TokenBlacklist;
import com.skillsync.auth.entity.User;
import com.skillsync.auth.repository.TokenBlacklistRepository;
import com.skillsync.auth.repository.UserRepository;
import com.skillsync.auth.util.JwtUtil;
import com.skillsync.shared.events.UserCreatedEvent;
import com.skillsync.auth.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RabbitTemplate rabbitTemplate;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    @Value("${jwt.expiration-remember-me}")
    private Long jwtExpirationRememberMe;

    public AuthService(UserRepository userRepository,
                      TokenBlacklistRepository tokenBlacklistRepository,
                      PasswordEncoder passwordEncoder,
                      JwtUtil jwtUtil,
                      RabbitTemplate rabbitTemplate) {
        this.userRepository = userRepository;
        this.tokenBlacklistRepository = tokenBlacklistRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * Register a new user
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        logger.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);

        user = userRepository.save(user);
        logger.info("User registered successfully with ID: {}", user.getId());

        UserCreatedEvent userCreatedEvent = new UserCreatedEvent(user.getId().toString());
        rabbitTemplate.convertAndSend(RabbitMQConfig.USER_EXCHANGE, "user.created", userCreatedEvent);

        return generateAuthResponse(user);
    }

    /**
     * Authenticate user and generate tokens
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        logger.info("Login attempt for email: {} (rememberMe: {})", request.getEmail(), request.isRememberMe());

        User user = userRepository.findActiveUserByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        logger.info("User logged in successfully: {} (rememberMe: {})", user.getId(), request.isRememberMe());
        return generateAuthResponse(user, request.isRememberMe());
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        logger.info("Refreshing token");

        if (tokenBlacklistRepository.existsByToken(refreshToken)) {
            throw new IllegalArgumentException("Token has been revoked");
        }

        if (!jwtUtil.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        String email = jwtUtil.extractUsername(refreshToken);
        User user = userRepository.findActiveUserByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        logger.info("Token refreshed for user: {}", user.getId());
        return generateAuthResponse(user);
    }

    /**
     * Logout user by blacklisting tokens
     */
    @Transactional
    public void logout(String accessToken, String refreshToken) {
        logger.info("Logging out user");

        try {
            String email = jwtUtil.extractUsername(accessToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            Date accessTokenExpiry = jwtUtil.extractExpiration(accessToken);
            Date refreshTokenExpiry = jwtUtil.extractExpiration(refreshToken);

            TokenBlacklist accessTokenBlacklist = new TokenBlacklist(
                accessToken,
                user.getId(),
                LocalDateTime.ofInstant(accessTokenExpiry.toInstant(), ZoneId.systemDefault())
            );

            TokenBlacklist refreshTokenBlacklist = new TokenBlacklist(
                refreshToken,
                user.getId(),
                LocalDateTime.ofInstant(refreshTokenExpiry.toInstant(), ZoneId.systemDefault())
            );

            tokenBlacklistRepository.save(accessTokenBlacklist);
            tokenBlacklistRepository.save(refreshTokenBlacklist);

            logger.info("User logged out successfully: {}", user.getId());
        } catch (Exception e) {
            logger.error("Error during logout: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid token");
        }
    }

    /**
     * Check if token is blacklisted
     */
    public boolean isTokenBlacklisted(String token) {
        return tokenBlacklistRepository.existsByToken(token);
    }

    /**
     * Generate authentication response with tokens
     */
    private AuthResponse generateAuthResponse(User user) {
        return generateAuthResponse(user, false);
    }

    /**
     * Generate authentication response with tokens and optional remember me
     */
    private AuthResponse generateAuthResponse(User user, boolean rememberMe) {
        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRoles(), rememberMe);
        String refreshToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRoles(), rememberMe);

        Long tokenExpiration = rememberMe ? jwtExpirationRememberMe : jwtExpiration;

        return new AuthResponse(
            user.getId(),
            user.getEmail(),
            accessToken,
            refreshToken,
            user.getRoles(),
            tokenExpiration
        );
    }

    /**
     * Clean up expired tokens from blacklist
     */
    @Transactional
    public void cleanupExpiredTokens() {
        logger.info("Cleaning up expired tokens");
        tokenBlacklistRepository.deleteExpiredTokens(LocalDateTime.now());
    }
}
