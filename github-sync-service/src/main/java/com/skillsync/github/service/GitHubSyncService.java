package com.skillsync.github.service;

import com.skillsync.github.client.GitHubApiClient;
import com.skillsync.github.dto.GitHubRepositoryDTO;
import com.skillsync.github.entity.GitHubRepository;
import com.skillsync.github.entity.SyncStatus;
import com.skillsync.github.mapper.GitHubRepositoryMapper;
import com.skillsync.github.repository.GitHubRepositoryRepository;
import com.skillsync.github.repository.SyncStatusRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GitHubSyncService {
    
    private static final Logger logger = LoggerFactory.getLogger(GitHubSyncService.class);
    
    private final GitHubApiClient gitHubApiClient;
    private final GitHubRepositoryRepository repositoryRepository;
    private final SyncStatusRepository syncStatusRepository;
    
    public GitHubSyncService(
            GitHubApiClient gitHubApiClient,
            GitHubRepositoryRepository repositoryRepository,
            SyncStatusRepository syncStatusRepository) {
        this.gitHubApiClient = gitHubApiClient;
        this.repositoryRepository = repositoryRepository;
        this.syncStatusRepository = syncStatusRepository;
    }
    
    public Mono<List<GitHubRepositoryDTO>> syncUserRepositories(String userId, String accessToken) {
        logger.info("Starting repository sync for user: {}", userId);
        
        // Update sync status to IN_PROGRESS
        updateSyncStatus(userId, "IN_PROGRESS", null, 0);
        
        return gitHubApiClient.getUserRepositories(accessToken)
                .flatMap(apiRepo -> {
                    // Fetch language statistics for each repository
                    return gitHubApiClient.getRepositoryLanguages(apiRepo.getLanguagesUrl(), accessToken)
                            .map(languages -> {
                                GitHubRepository entity = GitHubRepositoryMapper.toEntity(apiRepo, userId);
                                entity.setLanguages(languages);
                                return entity;
                            })
                            .onErrorResume(error -> {
                                logger.warn("Failed to fetch languages for repo {}: {}", apiRepo.getName(), error.getMessage());
                                GitHubRepository entity = GitHubRepositoryMapper.toEntity(apiRepo, userId);
                                return Mono.just(entity);
                            });
                })
                .collectList()
                .flatMap(repositories -> {
                    logger.info("Fetched {} repositories from GitHub for user: {}", repositories.size(), userId);
                    
                    // Save or update repositories
                    List<GitHubRepository> savedRepos = repositories.stream()
                            .map(repo -> {
                                return repositoryRepository.findByUserIdAndGithubId(userId, repo.getGithubId())
                                        .map(existing -> {
                                            // Update existing repository
                                            existing.setName(repo.getName());
                                            existing.setFullName(repo.getFullName());
                                            existing.setDescription(repo.getDescription());
                                            existing.setUrl(repo.getUrl());
                                            existing.setHtmlUrl(repo.getHtmlUrl());
                                            existing.setLanguage(repo.getLanguage());
                                            existing.setLanguages(repo.getLanguages());
                                            existing.setStars(repo.getStars());
                                            existing.setForks(repo.getForks());
                                            existing.setIsPrivate(repo.getIsPrivate());
                                            existing.setLastCommitAt(repo.getLastCommitAt());
                                            existing.setSyncedAt(LocalDateTime.now());
                                            existing.setUpdatedAt(LocalDateTime.now());
                                            return repositoryRepository.save(existing);
                                        })
                                        .orElseGet(() -> repositoryRepository.save(repo));
                            })
                            .collect(Collectors.toList());
                    
                    // Update sync status to SUCCESS
                    updateSyncStatus(userId, "SUCCESS", null, savedRepos.size());
                    
                    logger.info("Successfully synced {} repositories for user: {}", savedRepos.size(), userId);
                    
                    return Mono.just(savedRepos.stream()
                            .map(GitHubRepositoryMapper::toDTO)
                            .collect(Collectors.toList()));
                })
                .onErrorResume(error -> {
                    logger.error("Failed to sync repositories for user {}: {}", userId, error.getMessage(), error);
                    updateSyncStatus(userId, "FAILED", error.getMessage(), 0);
                    return Mono.error(new RuntimeException("Repository sync failed: " + error.getMessage()));
                });
    }
    
    public List<GitHubRepositoryDTO> getUserRepositories(String userId) {
        logger.debug("Fetching repositories for user: {}", userId);
        List<GitHubRepository> repositories = repositoryRepository.findByUserId(userId);
        return repositories.stream()
                .map(GitHubRepositoryMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public Map<String, Integer> getLanguageStatistics(String userId) {
        logger.debug("Calculating language statistics for user: {}", userId);
        List<GitHubRepository> repositories = repositoryRepository.findByUserId(userId);
        
        return repositories.stream()
                .filter(repo -> repo.getLanguages() != null && !repo.getLanguages().isEmpty())
                .flatMap(repo -> repo.getLanguages().entrySet().stream())
                .collect(Collectors.groupingBy(
                        Map.Entry::getKey,
                        Collectors.summingInt(Map.Entry::getValue)
                ));
    }
    
    public SyncStatus getSyncStatus(String userId) {
        return syncStatusRepository.findByUserId(userId)
                .orElse(null);
    }
    
    private void updateSyncStatus(String userId, String status, String errorMessage, int repositoriesSynced) {
        SyncStatus syncStatus = syncStatusRepository.findByUserId(userId)
                .orElse(new SyncStatus());
        
        syncStatus.setUserId(userId);
        syncStatus.setStatus(status);
        syncStatus.setErrorMessage(errorMessage);
        syncStatus.setRepositoriesSynced(repositoriesSynced);
        syncStatus.setLastSyncAt(LocalDateTime.now());
        syncStatus.setUpdatedAt(LocalDateTime.now());
        
        syncStatusRepository.save(syncStatus);
    }
}
