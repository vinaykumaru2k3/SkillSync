package com.skillsync.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
public class LoggingGlobalFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(LoggingGlobalFilter.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String traceId = UUID.randomUUID().toString().substring(0, 8);
        
        // Add trace ID to request headers for downstream services
        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-Trace-Id", traceId)
                .build();
        
        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(mutatedRequest)
                .build();

        long startTime = System.currentTimeMillis();
        String timestamp = LocalDateTime.now().format(formatter);

        // Log incoming request
        logger.info("[{}] [{}] Incoming Request: {} {} from {}",
                traceId,
                timestamp,
                request.getMethod(),
                request.getURI(),
                getClientIp(request));

        return chain.filter(mutatedExchange)
                .doOnSuccess(aVoid -> {
                    long duration = System.currentTimeMillis() - startTime;
                    ServerHttpResponse response = exchange.getResponse();
                    
                    // Log outgoing response
                    logger.info("[{}] [{}] Outgoing Response: {} {} - Status: {} - Duration: {}ms",
                            traceId,
                            LocalDateTime.now().format(formatter),
                            request.getMethod(),
                            request.getURI(),
                            response.getStatusCode(),
                            duration);
                })
                .doOnError(throwable -> {
                    long duration = System.currentTimeMillis() - startTime;
                    
                    // Log error response
                    logger.error("[{}] [{}] Error Response: {} {} - Error: {} - Duration: {}ms",
                            traceId,
                            LocalDateTime.now().format(formatter),
                            request.getMethod(),
                            request.getURI(),
                            throwable.getMessage(),
                            duration);
                });
    }

    private String getClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddress() != null ? 
                request.getRemoteAddress().getAddress().getHostAddress() : "unknown";
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}