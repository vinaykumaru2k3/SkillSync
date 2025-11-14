package com.skillsync.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .authorizeExchange(exchange -> exchange
                // Public endpoints
                .pathMatchers("/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/token/refresh").permitAll()
                .pathMatchers("/api/v1/auth/oauth/**", "/oauth2/**", "/login/oauth2/**").permitAll()
                .pathMatchers("/actuator/**").permitAll()
                // All other endpoints require authentication (handled by JwtAuthenticationFilter)
                .anyExchange().permitAll() // Filter handles auth, so permit here
            );
        
        return http.build();
    }
}
