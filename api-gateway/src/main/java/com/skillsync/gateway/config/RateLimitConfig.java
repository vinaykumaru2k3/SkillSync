package com.skillsync.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

@Configuration
public class RateLimitConfig {

    @Bean
    @Primary
    public KeyResolver userKeyResolver() {
        return exchange -> {
            // Try to get user ID from JWT token header
            String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                // In a real implementation, you would decode the JWT to get user ID
                // For now, we'll use a simple approach
                return Mono.just(authHeader.substring(7, Math.min(authHeader.length(), 20)));
            }
            
            // Fallback to IP-based rate limiting
            String clientIp = getClientIp(exchange);
            return Mono.just(clientIp);
        };
    }

    @Bean
    public KeyResolver ipKeyResolver() {
        return exchange -> Mono.just(getClientIp(exchange));
    }

    @Bean
    @Primary
    public RedisRateLimiter redisRateLimiter() {
        // Allow 100 requests per minute per user/IP
        return new RedisRateLimiter(100, 200, 1);
    }

    @Bean
    public RedisRateLimiter strictRedisRateLimiter() {
        // Stricter limits for sensitive endpoints (20 requests per minute)
        return new RedisRateLimiter(20, 40, 1);
    }

    private String getClientIp(org.springframework.web.server.ServerWebExchange exchange) {
        String xForwardedFor = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = exchange.getRequest().getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        var remoteAddress = exchange.getRequest().getRemoteAddress();
        if (remoteAddress != null && remoteAddress.getAddress() != null) {
            return remoteAddress.getAddress().getHostAddress();
        }
        
        return "unknown";
    }
}