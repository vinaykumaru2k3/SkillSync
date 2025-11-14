package com.skillsync.gateway.config;

import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig.SlidingWindowType;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import org.springframework.cloud.circuitbreaker.resilience4j.ReactiveResilience4JCircuitBreakerFactory;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JConfigBuilder;
import org.springframework.cloud.client.circuitbreaker.Customizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class CircuitBreakerConfig {

    @Bean
    public Customizer\u003cReactiveResilience4JCircuitBreakerFactory\u003e customizer() {
        return factory -\u003e {
            // Default configuration
            factory.configureDefault(id -\u003e new Resilience4JConfigBuilder(id)
                    .circuitBreakerConfig(io.github.resilience4j.circuitbreaker.CircuitBreakerConfig.custom()
                            .slidingWindowSize(10)
                            .slidingWindowType(SlidingWindowType.COUNT_BASED)
                            .failureRateThreshold(50)
                            .waitDurationInOpenState(Duration.ofSeconds(30))
                            .minimumNumberOfCalls(5)
                            .automaticTransitionFromOpenToHalfOpenEnabled(true)
                            .permittedNumberOfCallsInHalfOpenState(3)
                            .build())
                    .timeLimiterConfig(TimeLimiterConfig.custom()
                            .timeoutDuration(Duration.ofSeconds(10))
                            .build())
                    .build());

            // Auth service configuration
            factory.configure(builder -\u003e builder
                    .circuitBreakerConfig(io.github.resilience4j.circuitbreaker.CircuitBreakerConfig.custom()
                            .slidingWindowSize(20)
                            .slidingWindowType(SlidingWindowType.COUNT_BASED)
                            .failureRateThreshold(30)
                            .waitDurationInOpenState(Duration.ofSeconds(20))
                            .minimumNumberOfCalls(10)
                            .automaticTransitionFromOpenToHalfOpenEnabled(true)
                            .permittedNumberOfCallsInHalfOpenState(5)
                            .build())
                    .timeLimiterConfig(TimeLimiterConfig.custom()
                            .timeoutDuration(Duration.ofSeconds(5))
                            .build()), "auth-service");

            // Critical services configuration
            factory.configure(builder -\u003e builder
                    .circuitBreakerConfig(io.github.resilience4j.circuitbreaker.CircuitBreakerConfig.custom()
                            .slidingWindowSize(15)
                            .slidingWindowType(SlidingWindowType.COUNT_BASED)
                            .failureRateThreshold(40)
                            .waitDurationInOpenState(Duration.ofSeconds(15))
                            .minimumNumberOfCalls(8)
                            .automaticTransitionFromOpenToHalfOpenEnabled(true)
                            .permittedNumberOfCallsInHalfOpenState(4)
                            .build())
                    .timeLimiterConfig(TimeLimiterConfig.custom()
                            .timeoutDuration(Duration.ofSeconds(8))
                            .build()), "user-service", "project-service");
        };
    }
}