package com.skillsync.gateway.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

    @Autowired
    private ReactiveRedisTemplate<String, String> redisTemplate;

    @GetMapping
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("service", "api-gateway");

        return checkRedisHealth()
                .map(redisStatus -> {
                    health.put("redis", redisStatus);
                    return ResponseEntity.ok(health);
                })
                .onErrorReturn(ResponseEntity.ok(health));
    }

    @GetMapping("/ready")
    public Mono<ResponseEntity<Map<String, Object>>> readiness() {
        return checkRedisHealth()
                .map(redisStatus -> {
                    Map<String, Object> readiness = new HashMap<>();
                    readiness.put("status", "UP".equals(redisStatus.get("status")) ? "READY" : "NOT_READY");
                    readiness.put("timestamp", LocalDateTime.now());
                    readiness.put("checks", Map.of("redis", redisStatus));
                    return ResponseEntity.ok(readiness);
                })
                .onErrorReturn(ResponseEntity.status(503).body(Map.of(
                        "status", "NOT_READY",
                        "timestamp", LocalDateTime.now(),
                        "error", "Redis connection failed"
                )));
    }

    @GetMapping("/live")
    public ResponseEntity<Map<String, Object>> liveness() {
        Map<String, Object> liveness = new HashMap<>();
        liveness.put("status", "ALIVE");
        liveness.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(liveness);
    }

    private Mono<Map<String, Object>> checkRedisHealth() {
        return redisTemplate.opsForValue()
                .set("health:check", "ping")
                .timeout(Duration.ofSeconds(2))
                .then(redisTemplate.opsForValue().get("health:check"))
                .map(result -> {
                    Map<String, Object> redisHealth = new HashMap<>();
                    redisHealth.put("status", "ping".equals(result) ? "UP" : "DOWN");
                    redisHealth.put("responseTime", "< 2s");
                    return redisHealth;
                })
                .onErrorReturn(Map.of("status", "DOWN", "error", "Connection timeout"));
    }
}