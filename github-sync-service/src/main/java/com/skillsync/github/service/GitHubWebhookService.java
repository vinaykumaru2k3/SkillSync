package com.skillsync.github.service;

import com.skillsync.github.dto.GitHubWebhookEvent;
import com.skillsync.github.entity.GitHubRepository;
import com.skillsync.github.mapper.GitHubRepositoryMapper;
import com.skillsync.github.repository.GitHubRepositoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class GitHubWebhookService {
    
    private static final Logger logger = LoggerFactory.getLogger(GitHubWebhookService.class);
    
    private final GitHubRepositoryRepository repositoryRepository;
    
    public GitHubWebhookService(GitHubRepositoryRepository repositoryRepository) {
        this.repositoryRepository = repositoryRepository;
    }
    
    public void processRepositoryEvent(String eventType, GitHubWebhookEvent event, String userId) {
        logger.info("Processing webhook event: {} for repository: {}", eventType, event.getRepository().getName());
        
        switch (eventType) {
            case "push":
                handlePushEvent(event, userId);
                break;
            case "repository":
                handleRepositoryEvent(event, userId);
                break;
            case "star":
                handleStarEvent(event, userId);
                break;
            case "fork":
                handleForkEvent(event, userId);
                break;
            default:
                logger.debug("Unhandled webhook event type: {}", eventType);
        }
    }
    
    private void handlePushEvent(GitHubWebhookEvent event, String userId) {
        logger.debug("Handling push event for repository: {}", event.getRepository().getName());
        
        Optional<GitHubRepository> repoOpt = repositoryRepository.findByUserIdAndGithubId(
                userId, event.getRepository().getId());
        
        if (repoOpt.isPresent()) {
            GitHubRepository repo = repoOpt.get();
            repo.setLastCommitAt(LocalDateTime.now());
            repo.setUpdatedAt(LocalDateTime.now());
            repositoryRepository.save(repo);
            logger.info("Updated last commit time for repository: {}", repo.getName());
        } else {
            logger.warn("Repository not found for push event: {}", event.getRepository().getName());
        }
    }
    
    private void handleRepositoryEvent(GitHubWebhookEvent event, String userId) {
        String action = event.getAction();
        logger.debug("Handling repository event with action: {}", action);
        
        if ("created".equals(action)) {
            // Create new repository entry
            GitHubRepository newRepo = GitHubRepositoryMapper.toEntity(event.getRepository(), userId);
            repositoryRepository.save(newRepo);
            logger.info("Created new repository entry: {}", newRepo.getName());
        } else if ("deleted".equals(action)) {
            // Delete repository entry
            repositoryRepository.findByUserIdAndGithubId(userId, event.getRepository().getId())
                    .ifPresent(repo -> {
                        repositoryRepository.delete(repo);
                        logger.info("Deleted repository entry: {}", repo.getName());
                    });
        } else if ("edited".equals(action) || "publicized".equals(action) || "privatized".equals(action)) {
            // Update repository entry
            updateRepositoryFromWebhook(event, userId);
        }
    }
    
    private void handleStarEvent(GitHubWebhookEvent event, String userId) {
        logger.debug("Handling star event for repository: {}", event.getRepository().getName());
        updateRepositoryFromWebhook(event, userId);
    }
    
    private void handleForkEvent(GitHubWebhookEvent event, String userId) {
        logger.debug("Handling fork event for repository: {}", event.getRepository().getName());
        updateRepositoryFromWebhook(event, userId);
    }
    
    private void updateRepositoryFromWebhook(GitHubWebhookEvent event, String userId) {
        Optional<GitHubRepository> repoOpt = repositoryRepository.findByUserIdAndGithubId(
                userId, event.getRepository().getId());
        
        if (repoOpt.isPresent()) {
            GitHubRepository repo = repoOpt.get();
            repo.setName(event.getRepository().getName());
            repo.setFullName(event.getRepository().getFullName());
            repo.setDescription(event.getRepository().getDescription());
            repo.setStars(event.getRepository().getStargazersCount());
            repo.setForks(event.getRepository().getForksCount());
            repo.setIsPrivate(event.getRepository().getIsPrivate());
            repo.setUpdatedAt(LocalDateTime.now());
            repositoryRepository.save(repo);
            logger.info("Updated repository from webhook: {}", repo.getName());
        } else {
            logger.warn("Repository not found for webhook update: {}", event.getRepository().getName());
        }
    }
}
