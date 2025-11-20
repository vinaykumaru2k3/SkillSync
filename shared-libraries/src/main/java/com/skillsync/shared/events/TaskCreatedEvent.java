package com.skillsync.shared.events;

import java.time.Instant;

public class TaskCreatedEvent {
    private String taskId;
    private String projectId;
    private String taskName;
    private String creatorId;
    private Instant createdAt;

    public TaskCreatedEvent() {
    }

    public TaskCreatedEvent(String taskId, String projectId, String taskName, String creatorId) {
        this.taskId = taskId;
        this.projectId = projectId;
        this.taskName = taskName;
        this.creatorId = creatorId;
        this.createdAt = Instant.now();
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
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