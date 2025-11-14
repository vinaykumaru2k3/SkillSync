package com.skillsync.github.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GitHubWebhookEvent {
    
    private String action;
    private GitHubApiRepositoryResponse repository;
    private GitHubWebhookSender sender;
    
    @JsonProperty("pusher")
    private GitHubWebhookPusher pusher;
    
    // Getters and Setters
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
    
    public GitHubApiRepositoryResponse getRepository() {
        return repository;
    }
    
    public void setRepository(GitHubApiRepositoryResponse repository) {
        this.repository = repository;
    }
    
    public GitHubWebhookSender getSender() {
        return sender;
    }
    
    public void setSender(GitHubWebhookSender sender) {
        this.sender = sender;
    }
    
    public GitHubWebhookPusher getPusher() {
        return pusher;
    }
    
    public void setPusher(GitHubWebhookPusher pusher) {
        this.pusher = pusher;
    }
    
    public static class GitHubWebhookSender {
        private Long id;
        private String login;
        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getLogin() {
            return login;
        }
        
        public void setLogin(String login) {
            this.login = login;
        }
    }
    
    public static class GitHubWebhookPusher {
        private String name;
        private String email;
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getEmail() {
            return email;
        }
        
        public void setEmail(String email) {
            this.email = email;
        }
    }
}
