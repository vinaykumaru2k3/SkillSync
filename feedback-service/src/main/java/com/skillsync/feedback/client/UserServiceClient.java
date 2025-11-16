package com.skillsync.feedback.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.UUID;

@Component
public class UserServiceClient {
    private final RestTemplate restTemplate;
    
    @Value("${services.user-service.url:http://localhost:8082}")
    private String userServiceUrl;

    public UserServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public UserInfo getUserInfo(UUID userId) {
        try {
            return restTemplate.getForObject(
                userServiceUrl + "/api/v1/users/user/" + userId,
                UserInfo.class
            );
        } catch (Exception e) {
            return null;
        }
    }

    public static class UserInfo {
        private String username;
        private String displayName;
        private String profileImageUrl;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getDisplayName() {
            return displayName;
        }

        public void setDisplayName(String displayName) {
            this.displayName = displayName;
        }

        public String getProfileImageUrl() {
            return profileImageUrl;
        }

        public void setProfileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
        }
    }
}
