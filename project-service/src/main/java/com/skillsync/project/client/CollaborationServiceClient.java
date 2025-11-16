package com.skillsync.project.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Component
public class CollaborationServiceClient {

    private final RestTemplate restTemplate;
    private final String collaborationServiceUrl;

    public CollaborationServiceClient(RestTemplate restTemplate,
                                     @Value("${services.collaboration-service.url:http://localhost:8085}") String collaborationServiceUrl) {
        this.restTemplate = restTemplate;
        this.collaborationServiceUrl = collaborationServiceUrl;
    }

    public List<UUID> getCollaboratedProjectIds(UUID userId) {
        try {
            String url = collaborationServiceUrl + "/api/v1/collaborations/user/" + userId + "/projects";
            ResponseEntity<List<UUID>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<UUID>>() {}
            );
            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            System.err.println("Failed to fetch collaborated projects for user " + userId + ": " + e.getMessage());
            return Collections.emptyList();
        }
    }

    public boolean hasWritePermission(UUID projectId, UUID userId) {
        try {
            String url = collaborationServiceUrl + "/api/v1/collaborations/projects/" + projectId + "/permissions";
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("X-User-Id", userId.toString());
            org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(headers);
            
            ResponseEntity<PermissionResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                PermissionResponse.class
            );
            return response.getBody() != null && response.getBody().getData().isCanWrite();
        } catch (Exception e) {
            System.err.println("Failed to check permissions for user " + userId + " on project " + projectId + ": " + e.getMessage());
            return false;
        }
    }

    public static class PermissionResponse {
        private PermissionData data;

        public PermissionData getData() {
            return data;
        }

        public void setData(PermissionData data) {
            this.data = data;
        }
    }

    public static class PermissionData {
        private boolean canWrite;

        public boolean isCanWrite() {
            return canWrite;
        }

        public void setCanWrite(boolean canWrite) {
            this.canWrite = canWrite;
        }
    }
}
