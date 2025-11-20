package com.skillsync.shared.events;

import java.time.Instant;

public class UserCreatedEvent {
    private String userId;
    private Instant createdAt;

    public UserCreatedEvent() {
    }

    public UserCreatedEvent(String userId) {
        this.userId = userId;
        this.createdAt = Instant.now();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}