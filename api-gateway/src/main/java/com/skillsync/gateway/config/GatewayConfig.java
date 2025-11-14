package com.skillsync.gateway.config;

import com.skillsync.gateway.filter.LoggingGlobalFilter;
import com.skillsync.gateway.filter.SecurityHeadersFilter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder,
                                         @Qualifier("userKeyResolver") KeyResolver keyResolver,
                                         @Qualifier("redisRateLimiter") RedisRateLimiter redisRateLimiter,
                                         @Qualifier("strictRedisRateLimiter") RedisRateLimiter strictRateLimiter) {
        return builder.routes()
                // Auth Service Routes (stricter rate limiting)
                .route("auth-service", r -> r
                        .path("/api/v1/auth/**")
                        .filters(f -> f
                                .filter(new SecurityHeadersFilter())
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(strictRateLimiter)
                                        .setKeyResolver(keyResolver))
                                .circuitBreaker(config -> config
                                        .setName("auth-service")
                                        .setFallbackUri("forward:/fallback/auth-service"))
                        )
                        .uri("http://localhost:8081")
                )
                
                // User Service Routes (both /users and /user paths)
                .route("user-service", r -> r
                        .path("/api/v1/users/**", "/api/v1/user/**")
                        .filters(f -> f
                                .filter(new SecurityHeadersFilter())
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(keyResolver))
                                .circuitBreaker(config -> config
                                        .setName("user-service")
                                        .setFallbackUri("forward:/fallback/user-service"))
                        )
                        .uri("http://localhost:8082")
                )
                
                // Project Service Routes
                .route("project-service", r -> r
                        .path("/api/v1/projects/**", "/api/v1/tasks/**")
                        .filters(f -> f
                                .filter(new SecurityHeadersFilter())
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(keyResolver))
                                .circuitBreaker(config -> config
                                        .setName("project-service")
                                        .setFallbackUri("forward:/fallback/project-service"))
                        )
                        .uri("http://localhost:8083")
                )
                
                // GitHub Sync Service Routes
                .route("github-service", r -> r
                        .path("/api/v1/github/**")
                        .filters(f -> f
                                .filter(new SecurityHeadersFilter())
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(keyResolver))
                                .circuitBreaker(config -> config
                                        .setName("github-service")
                                        .setFallbackUri("forward:/fallback/github-service"))
                        )
                        .uri("http://localhost:8084")
                )
                
                // Collaboration Service Routes
                .route("collaboration-service", r -> r
                        .path("/api/v1/collaborations/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(new SecurityHeadersFilter())
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(keyResolver))
                                .circuitBreaker(config -> config
                                        .setName("collaboration-service")
                                        .setFallbackUri("forward:/fallback/collaboration-service"))
                        )
                        .uri("http://localhost:8085")
                )
                
                // Feedback Service Routes
                .route("feedback-service", r -> r
                        .path("/api/v1/feedback/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(new SecurityHeadersFilter())
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(keyResolver))
                                .circuitBreaker(config -> config
                                        .setName("feedback-service")
                                        .setFallbackUri("forward:/fallback/feedback-service"))
                        )
                        .uri("http://localhost:8086")
                )
                
                // Notification Service Routes
                .route("notification-service", r -> r
                        .path("/api/v1/notifications/**")
                        .filters(f -> f
                                .stripPrefix(2)
                                .filter(new SecurityHeadersFilter())
                                .requestRateLimiter(config -> config
                                        .setRateLimiter(redisRateLimiter)
                                        .setKeyResolver(keyResolver))
                                .circuitBreaker(config -> config
                                        .setName("notification-service")
                                        .setFallbackUri("forward:/fallback/notification-service"))
                        )
                        .uri("http://localhost:8087")
                )
                
                // WebSocket Routes for Notifications (no rate limiting for WebSocket)
                .route("notification-websocket", r -> r
                        .path("/ws/notifications/**")
                        .filters(f -> f
                                .circuitBreaker(config -> config
                                        .setName("notification-service")
                                        .setFallbackUri("forward:/fallback/notification-service"))
                        )
                        .uri("http://localhost:8087")
                )
                
                .build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        corsConfig.setAllowedOriginPatterns(Collections.singletonList("*"));
        corsConfig.setMaxAge(3600L);
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }

    @Bean
    public LoggingGlobalFilter loggingGlobalFilter() {
        return new LoggingGlobalFilter();
    }
}