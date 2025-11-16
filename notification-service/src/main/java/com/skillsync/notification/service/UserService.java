package com.skillsync.notification.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    @Value("${user.service.url:http://localhost:8082}")
    private String userServiceUrl;
    
    private final RestTemplate restTemplate;
    
    public UserService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    public String getUserEmail(String userId) {
        try {
            Map<String, Object> response = restTemplate.getForObject(
                userServiceUrl + "/api/v1/users/" + userId,
                Map.class
            );
            return response != null ? (String) response.get("email") : null;
        } catch (Exception e) {
            logger.error("Failed to fetch user email for userId {}: {}", userId, e.getMessage());
            return null;
        }
    }
}
