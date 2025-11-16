package com.skillsync.project.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Component
public class UserServiceClient {

    private final RestTemplate restTemplate;
    private final String userServiceUrl;

    public UserServiceClient(RestTemplate restTemplate,
                            @Value("${services.user-service.url:http://localhost:8082}") String userServiceUrl) {
        this.restTemplate = restTemplate;
        this.userServiceUrl = userServiceUrl;
    }

    public UserInfo getUserInfo(UUID userId) {
        try {
            String url = userServiceUrl + "/api/v1/users/user/" + userId;
            return restTemplate.getForObject(url, UserInfo.class);
        } catch (Exception e) {
            System.err.println("Failed to fetch user info for " + userId + ": " + e.getMessage());
            return new UserInfo("Unknown", null);
        }
    }
    
    public java.util.Map<String, Object> getUserById(String userId) {
        try {
            String url = userServiceUrl + "/api/v1/users/user/" + userId;
            return restTemplate.getForObject(url, java.util.Map.class);
        } catch (Exception e) {
            System.err.println("Failed to fetch user by id " + userId + ": " + e.getMessage());
            return new java.util.HashMap<>();
        }
    }
    
    public java.util.Map<String, Object> getUserByUsername(String username) {
        try {
            String url = userServiceUrl + "/api/v1/users/username/" + username;
            return restTemplate.getForObject(url, java.util.Map.class);
        } catch (Exception e) {
            System.err.println("Failed to fetch user by username " + username + ": " + e.getMessage());
            return new java.util.HashMap<>();
        }
    }

    public static class UserInfo {
        private String username;
        private String profileImageUrl;

        public UserInfo() {}

        public UserInfo(String username, String profileImageUrl) {
            this.username = username;
            this.profileImageUrl = profileImageUrl;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getProfileImageUrl() {
            return profileImageUrl;
        }

        public void setProfileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
        }
    }
}
