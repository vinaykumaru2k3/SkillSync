package com.skillsync.shared.events;

import java.time.Instant;

public class FeedbackSubmittedEvent {
    private String feedbackId;
    private String projectId;
    private String userId;
    private Instant submittedAt;

    public FeedbackSubmittedEvent() {
    }

    public FeedbackSubmittedEvent(String feedbackId, String projectId, String userId) {
        this.feedbackId = feedbackId;
        this.projectId = projectId;
        this.userId = userId;
        this.submittedAt = Instant.now();
    }

    public String getFeedbackId() {
        return feedbackId;
    }

    public void setFeedbackId(String feedbackId) {
        this.feedbackId = feedbackId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }
}