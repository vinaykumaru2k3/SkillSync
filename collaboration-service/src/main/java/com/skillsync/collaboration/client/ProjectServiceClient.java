package com.skillsync.collaboration.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Component
public class ProjectServiceClient {

    private final RestTemplate restTemplate;
    private final String projectServiceUrl;

    public ProjectServiceClient(RestTemplate restTemplate,
                              @Value("${services.project-service.url:http://localhost:8083}") String projectServiceUrl) {
        this.restTemplate = restTemplate;
        this.projectServiceUrl = projectServiceUrl;
    }

    public ProjectInfo getProjectInfo(UUID projectId) {
        try {
            return restTemplate.getForObject(
                projectServiceUrl + "/api/v1/projects/" + projectId,
                ProjectInfo.class
            );
        } catch (Exception e) {
            System.err.println("Failed to fetch project info for " + projectId + ": " + e.getMessage());
            return new ProjectInfo("Unknown Project", "Project not found");
        }
    }

    public static class ProjectInfo {
        private String name;
        private String description;

        public ProjectInfo() {}

        public ProjectInfo(String name, String description) {
            this.name = name;
            this.description = description;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}