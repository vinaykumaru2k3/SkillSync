package com.skillsync.github.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "commit_activity")
public class CommitActivity {
    
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed
    private LocalDate date;
    
    private Integer commitCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public CommitActivity() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public CommitActivity(String userId, LocalDate date, Integer commitCount) {
        this.userId = userId;
        this.date = date;
        this.commitCount = commitCount;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public Integer getCommitCount() {
        return commitCount;
    }
    
    public void setCommitCount(Integer commitCount) {
        this.commitCount = commitCount;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
