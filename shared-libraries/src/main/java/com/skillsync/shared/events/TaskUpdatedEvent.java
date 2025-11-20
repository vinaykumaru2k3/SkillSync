package com.skillsync.shared.events;

import java.time.Instant;

public class TaskUpdatedEvent {
    private String taskId;
    private String projectId;
    private String taskName;
    private String updaterId;
    private Instant updatedAt;

    public TaskUpdatedEvent() {
    }

    public TaskUpdatedEvent(String taskId, String projectId, String taskName, String updaterId) {
        this.taskId = taskId;
        this.projectId = projectId;
        this.taskName = taskName;
        this.updaterId = updaterId;
        this.updatedAt = Instant.now();
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

    public String getUpdaterId() {
        return updaterId;
    }

    public void setUpdaterId(String updaterId) {
        this.updaterId = updaterId;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}