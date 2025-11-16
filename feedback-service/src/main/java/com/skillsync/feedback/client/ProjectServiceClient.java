package com.skillsync.feedback.client;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Component
@Slf4j
public class ProjectServiceClient {

    @Value("${services.project-service.url:http://localhost:8083}")
    private String projectServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public ProjectInfo getProjectInfo(UUID projectId) {
        try {
            String url = projectServiceUrl + "/api/v1/projects/" + projectId;
            return restTemplate.getForObject(url, ProjectInfo.class);
        } catch (Exception e) {
            log.error("Failed to fetch project info for project {}", projectId, e);
            ProjectInfo fallback = new ProjectInfo();
            fallback.setId(projectId);
            fallback.setName("Unknown Project");
            fallback.setOwnerId(UUID.randomUUID());
            return fallback;
        }
    }

    @Data
    public static class ProjectInfo {
        private UUID id;
        private UUID ownerId;
        private String name;
    }
}
