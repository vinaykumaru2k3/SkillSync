package com.skillsync.github.service;

import com.skillsync.github.client.GitHubApiClient;
import com.skillsync.github.dto.GitHubRepositoryDTO;
import com.skillsync.github.entity.CommitActivity;
import com.skillsync.github.entity.GitHubRepository;
import com.skillsync.github.entity.SyncStatus;
import com.skillsync.github.mapper.GitHubRepositoryMapper;
import com.skillsync.github.repository.CommitActivityRepository;
import com.skillsync.github.repository.GitHubRepositoryRepository;
import com.skillsync.github.repository.SyncStatusRepository;
import com.skillsync.shared.events.GitHubRepoSyncedEvent;
import com.skillsync.github.config.RabbitMQConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GitHubSyncService {

    private static final Logger logger = LoggerFactory.getLogger(GitHubSyncService.class);

    private final GitHubApiClient gitHubApiClient;
    private final GitHubRepositoryRepository repositoryRepository;
    private final SyncStatusRepository syncStatusRepository;
    private final CommitActivityRepository commitActivityRepository;
    
    @Autowired
    private RabbitTemplate rabbitTemplate;

    public GitHubSyncService(
            GitHubApiClient gitHubApiClient,
            GitHubRepositoryRepository repositoryRepository,
            SyncStatusRepository syncStatusRepository,
            CommitActivityRepository commitActivityRepository) {
        this.gitHubApiClient = gitHubApiClient;
        this.repositoryRepository = repositoryRepository;
        this.syncStatusRepository = syncStatusRepository;
        this.commitActivityRepository = commitActivityRepository;
    }

    private String extractOwnerFromFullName(String fullName) {
        if (fullName != null && fullName.contains("/")) {
            return fullName.split("/")[0];
        }
        return null;
    }

    public Mono<List<GitHubRepositoryDTO>> syncUserRepositories(String userId, String accessToken) {
        logger.info("Starting repository sync for user: {}", userId);

        // Update sync status to IN_PROGRESS
        updateSyncStatus(userId, "IN_PROGRESS", null, 0);

        return gitHubApiClient.getUserRepositories(accessToken)
                .flatMap(apiRepo -> {
                    String owner = extractOwnerFromFullName(apiRepo.getFullName());

                    // Fetch language statistics and commit count for each repository
                    Mono<Map<String, Integer>> languagesMono = gitHubApiClient
                            .getRepositoryLanguages(apiRepo.getLanguagesUrl(), accessToken)
                            .onErrorResume(error -> {
                                logger.warn("Failed to fetch languages for repo {}: {}", apiRepo.getName(), error.getMessage());
                                return Mono.just(Map.of());
                            });

                    Mono<Integer> commitCountMono = gitHubApiClient
                            .getRepositoryCommitCount(owner, apiRepo.getName(), accessToken)
                            .onErrorResume(error -> {
                                logger.warn("Failed to fetch commit count for repo {}: {}", apiRepo.getName(), error.getMessage());
                                return Mono.just(0);
                            });

                    return Mono.zip(languagesMono, commitCountMono)
                            .map(tuple -> {
                                GitHubRepository entity = GitHubRepositoryMapper.toEntity(apiRepo, userId);
                                entity.setLanguages(tuple.getT1());
                                entity.setCommitCount(tuple.getT2());
                                return entity;
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
                                            existing.setCommitCount(repo.getCommitCount());
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

                    savedRepos.forEach(repo -> {
                        GitHubRepoSyncedEvent gitHubRepoSyncedEvent = new GitHubRepoSyncedEvent(String.valueOf(repo.getGithubId()), userId);
                        rabbitTemplate.convertAndSend(RabbitMQConfig.GITHUB_EXCHANGE, "github.repo.synced", gitHubRepoSyncedEvent);
                    });

                    logger.info("Successfully synced {} repositories for user: {}", savedRepos.size(), userId);

                    // Update contribution data in the background
                    updateContributionData(userId, accessToken).subscribe();
                    
                    savedRepos.forEach(repo -> {
                        GitHubRepoSyncedEvent gitHubRepoSyncedEvent = new GitHubRepoSyncedEvent(String.valueOf(repo.getGithubId()), userId);
                        rabbitTemplate.convertAndSend(RabbitMQConfig.GITHUB_EXCHANGE, "github.repo.synced", gitHubRepoSyncedEvent);
                    });

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

    public Map<String, Object> getActivitySummary(String userId) {
        logger.debug("Calculating activity summary for user: {}", userId);
        List<GitHubRepository> repositories = repositoryRepository.findByUserId(userId);

        // Calculate total commits
        int totalCommits = repositories.stream()
                .filter(repo -> repo.getCommitCount() != null)
                .mapToInt(GitHubRepository::getCommitCount)
                .sum();

        // Find most active repository
        GitHubRepository mostActiveRepo = repositories.stream()
                .filter(repo -> repo.getCommitCount() != null && repo.getCommitCount() > 0)
                .max((r1, r2) -> Integer.compare(r1.getCommitCount(), r2.getCommitCount()))
                .orElse(null);

        // Calculate average commits per repository
        double avgCommitsPerRepo = repositories.stream()
                .filter(repo -> repo.getCommitCount() != null)
                .mapToInt(GitHubRepository::getCommitCount)
                .average()
                .orElse(0.0);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCommits", totalCommits);
        summary.put("totalRepositories", repositories.size());
        summary.put("averageCommitsPerRepo", Math.round(avgCommitsPerRepo));

        if (mostActiveRepo != null) {
            Map<String, Object> mostActive = new HashMap<>();
            mostActive.put("name", mostActiveRepo.getName());
            mostActive.put("commitCount", mostActiveRepo.getCommitCount());
            mostActive.put("url", mostActiveRepo.getHtmlUrl());
            summary.put("mostActiveRepository", mostActive);
        }

        return summary;
    }

    public Map<String, Integer> getContributionCalendar(String userId) {
        logger.debug("Fetching contribution calendar for user: {}", userId);

        // Get all repositories for the user
        List<GitHubRepository> repositories = repositoryRepository.findByUserId(userId);

        // Create a simulated contribution calendar based on repository data
        Map<String, Integer> calendar = new HashMap<>();

        // For each repository, add contributions based on last commit date
        repositories.forEach(repo -> {
            if (repo.getLastCommitAt() != null) {
                String dateKey = repo.getLastCommitAt().toLocalDate().toString();
                // Add 1-5 contributions per repository on its last commit date
                int contributions = Math.min(repo.getCommitCount() != null ? repo.getCommitCount() / 10 : 1, 5);
                calendar.merge(dateKey, Math.max(contributions, 1), Integer::sum);
            }
        });

        // Also check stored commit activities
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusYears(1);

        List<CommitActivity> activities = commitActivityRepository.findByUserIdAndDateBetween(
                userId, startDate, endDate);

        // Merge with stored activities
        activities.forEach(activity -> {
            calendar.merge(activity.getDate().toString(), activity.getCommitCount(), Integer::sum);
        });

        return calendar;
    }

    public Mono<Void> updateContributionData(String userId, String accessToken) {
        logger.debug("Updating contribution data for user: {}", userId);

        // First get the user's GitHub username
        return gitHubApiClient.getUserLogin(accessToken)
                .flatMap(username -> {
                    if (username.isEmpty()) {
                        logger.warn("Could not fetch GitHub username for user: {}", userId);
                        return Mono.empty();
                    }

                    // Fetch recent events (last 100 events)
                    return gitHubApiClient.getUserEvents(username, accessToken)
                            .collectList()
                            .doOnNext(events -> {
                                Map<LocalDate, Integer> dailyCommits = new HashMap<>();

                                // Process events to extract commit dates
                                events.forEach(event -> {
                                    String type = (String) event.get("type");
                                    if ("PushEvent".equals(type)) {
                                        String createdAt = (String) event.get("created_at");
                                        if (createdAt != null) {
                                            try {
                                                LocalDate date = LocalDateTime.parse(createdAt.substring(0, 19))
                                                        .toLocalDate();

                                                // Count commits in this push event
                                                @SuppressWarnings("unchecked")
                                                Map<String, Object> payload = (Map<String, Object>) event.get("payload");
                                                if (payload != null) {
                                                    @SuppressWarnings("unchecked")
                                                    java.util.List<Object> commits = (java.util.List<Object>) payload.get("commits");
                                                    int commitCount = commits != null ? commits.size() : 1;
                                                    dailyCommits.merge(date, commitCount, Integer::sum);
                                                }
                                            } catch (Exception e) {
                                                logger.warn("Failed to parse event date: {}", createdAt);
                                            }
                                        }
                                    }
                                });

                                // Save or update commit activity records
                                dailyCommits.forEach((date, count) -> {
                                    CommitActivity activity = commitActivityRepository
                                            .findByUserIdAndDate(userId, date)
                                            .orElse(new CommitActivity(userId, date, 0));

                                    activity.setCommitCount(count);
                                    activity.setUpdatedAt(LocalDateTime.now());
                                    commitActivityRepository.save(activity);
                                });

                                logger.info("Updated contribution data for user {} with {} days of activity",
                                        userId, dailyCommits.size());
                            })
                            .then();
                });
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
