package com.skillsync.shared.events;

import java.time.Instant;

public class UserProfileUpdatedEvent {
    private String userId;
    private Instant updatedAt;

    public UserProfileUpdatedEvent() {
    }

    public UserProfileUpdatedEvent(String userId) {
        this.userId = userId;
        this.updatedAt = Instant.now();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}