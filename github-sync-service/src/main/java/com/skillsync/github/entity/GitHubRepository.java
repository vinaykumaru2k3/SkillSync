package com.skillsync.github.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "github_repositories")
public class GitHubRepository {
    
    @Id
    private String id;
    
    @Indexed
    private String userId;
    
    @Indexed
    private Long githubId;
    
    private String name;
    private String fullName;
    private String description;
    private String url;
    private String htmlUrl;
    private String language;
    private Map<String, Integer> languages;
    private Integer stars;
    private Integer forks;
    private Boolean isPrivate;
    private Integer commitCount;
    private LocalDateTime lastCommitAt;
    private LocalDateTime syncedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public GitHubRepository() {
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
    
    public Long getGithubId() {
        return githubId;
    }
    
    public void setGithubId(Long githubId) {
        this.githubId = githubId;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
    
    public String getHtmlUrl() {
        return htmlUrl;
    }
    
    public void setHtmlUrl(String htmlUrl) {
        this.htmlUrl = htmlUrl;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public Map<String, Integer> getLanguages() {
        return languages;
    }
    
    public void setLanguages(Map<String, Integer> languages) {
        this.languages = languages;
    }
    
    public Integer getStars() {
        return stars;
    }
    
    public void setStars(Integer stars) {
        this.stars = stars;
    }
    
    public Integer getForks() {
        return forks;
    }
    
    public void setForks(Integer forks) {
        this.forks = forks;
    }
    
    public Boolean getIsPrivate() {
        return isPrivate;
    }
    
    public void setIsPrivate(Boolean isPrivate) {
        this.isPrivate = isPrivate;
    }
    
    public LocalDateTime getLastCommitAt() {
        return lastCommitAt;
    }
    
    public void setLastCommitAt(LocalDateTime lastCommitAt) {
        this.lastCommitAt = lastCommitAt;
    }
    
    public LocalDateTime getSyncedAt() {
        return syncedAt;
    }
    
    public void setSyncedAt(LocalDateTime syncedAt) {
        this.syncedAt = syncedAt;
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
    
    public Integer getCommitCount() {
        return commitCount;
    }
    
    public void setCommitCount(Integer commitCount) {
        this.commitCount = commitCount;
    }
}
