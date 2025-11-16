package com.skillsync.collaboration.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

class UserProfileDto {
    private String displayName;
    private String username;
    private String profileImageUrl;
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
}

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
            UserProfileDto profile = restTemplate.getForObject(
                userServiceUrl + "/api/v1/users/user/" + userId, 
                UserProfileDto.class
            );
            if (profile != null) {
                return new UserInfo(profile.getDisplayName(), profile.getUsername(), profile.getProfileImageUrl());
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch user info for " + userId + ": " + e.getMessage());
        }
        return new UserInfo("Unknown User", "unknown_user", null);
    }

    public static class UserInfo {
        private String displayName;
        private String username;
        private String profileImageUrl;

        public UserInfo() {}

        public UserInfo(String displayName, String username, String profileImageUrl) {
            this.displayName = displayName;
            this.username = username;
            this.profileImageUrl = profileImageUrl;
        }

        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getProfileImageUrl() { return profileImageUrl; }
        public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    }
}