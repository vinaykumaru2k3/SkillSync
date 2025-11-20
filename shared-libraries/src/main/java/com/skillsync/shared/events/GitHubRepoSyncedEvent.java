package com.skillsync.shared.events;

import java.time.Instant;

public class GitHubRepoSyncedEvent {
    private String repoId;
    private String userId;
    private Instant syncedAt;

    public GitHubRepoSyncedEvent() {
    }

    public GitHubRepoSyncedEvent(String repoId, String userId) {
        this.repoId = repoId;
        this.userId = userId;
        this.syncedAt = Instant.now();
    }

    public String getRepoId() {
        return repoId;
    }

    public void setRepoId(String repoId) {
        this.repoId = repoId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Instant getSyncedAt() {
        return syncedAt;
    }

    public void setSyncedAt(Instant syncedAt) {
        this.syncedAt = syncedAt;
    }
}