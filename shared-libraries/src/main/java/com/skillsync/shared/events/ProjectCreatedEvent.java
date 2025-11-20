package com.skillsync.shared.events;

import java.time.Instant;

public class ProjectCreatedEvent {
    private String projectId;
    private String projectName;
    private String creatorId;
    private Instant createdAt;

    public ProjectCreatedEvent() {
    }

    public ProjectCreatedEvent(String projectId, String projectName, String creatorId) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.creatorId = creatorId;
        this.createdAt = Instant.now();
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}