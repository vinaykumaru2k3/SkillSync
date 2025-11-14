package com.skillsync.github.client;

import com.skillsync.github.dto.GitHubApiRepositoryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.Map;

@Component
public class GitHubApiClient {
    
    private static final Logger logger = LoggerFactory.getLogger(GitHubApiClient.class);
    
    private final WebClient webClient;
    private final long retryDelay;
    
    public GitHubApiClient(
            @Value("${github.api.base-url}") String baseUrl,
            @Value("${github.api.rate-limit.retry-delay}") long retryDelay) {
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
        this.retryDelay = retryDelay;
    }
    
    public Flux<GitHubApiRepositoryResponse> getUserRepositories(String accessToken) {
        logger.debug("Fetching user repositories from GitHub");
        
        return webClient.get()
                .uri("/user/repos?per_page=100&sort=updated")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github.v3+json")
                .retrieve()
                .onStatus(status -> status.value() == 429, response -> {
                    logger.warn("Rate limit exceeded, will retry after delay");
                    return Mono.error(new RuntimeException("GitHub API rate limit exceeded"));
                })
                .onStatus(HttpStatusCode::is4xxClientError, response -> {
                    logger.error("Client error fetching repositories: {}", response.statusCode());
                    return Mono.error(new RuntimeException("Failed to fetch repositories: " + response.statusCode()));
                })
                .onStatus(HttpStatusCode::is5xxServerError, response -> {
                    logger.error("Server error fetching repositories: {}", response.statusCode());
                    return Mono.error(new RuntimeException("GitHub API server error: " + response.statusCode()));
                })
                .bodyToFlux(GitHubApiRepositoryResponse.class)
                .retryWhen(Retry.backoff(3, Duration.ofMillis(retryDelay))
                        .maxBackoff(Duration.ofSeconds(10))
                        .filter(throwable -> throwable.getMessage().contains("rate limit") || 
                                throwable.getMessage().contains("server error"))
                        .doBeforeRetry(signal -> logger.warn("Retrying GitHub API call, attempt: {}", signal.totalRetries() + 1)));
    }
    
    @SuppressWarnings("unchecked")
    public Mono<Map<String, Integer>> getRepositoryLanguages(String languagesUrl, String accessToken) {
        logger.debug("Fetching repository languages from: {}", languagesUrl);
        
        return webClient.get()
                .uri(languagesUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github.v3+json")
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, response -> {
                    logger.error("Client error fetching languages: {}", response.statusCode());
                    return Mono.error(new RuntimeException("Failed to fetch languages: " + response.statusCode()));
                })
                .bodyToMono(Map.class)
                .map(map -> (Map<String, Integer>) map)
                .retryWhen(Retry.backoff(3, Duration.ofMillis(retryDelay))
                        .maxBackoff(Duration.ofSeconds(10)));
    }
    
    public Mono<String> getUserProfile(String accessToken) {
        logger.debug("Fetching user profile from GitHub");
        
        return webClient.get()
                .uri("/user")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github.v3+json")
                .retrieve()
                .bodyToMono(String.class);
    }
    
    @SuppressWarnings("unchecked")
    public Mono<Integer> getRepositoryCommitCount(String owner, String repo, String accessToken) {
        logger.debug("Fetching commit count for repository: {}/{}", owner, repo);
        
        // Use the participation stats endpoint which gives us commit counts
        return webClient.get()
                .uri("/repos/{owner}/{repo}/stats/participation", owner, repo)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github.v3+json")
                .retrieve()
                .bodyToMono(Map.class)
                .map(stats -> {
                    // The participation endpoint returns all commits and owner commits
                    Object allObj = stats.get("all");
                    if (allObj instanceof java.util.List) {
                        java.util.List<Integer> all = (java.util.List<Integer>) allObj;
                        // Sum all weekly commit counts
                        return all.stream().mapToInt(Integer::intValue).sum();
                    }
                    return 0;
                })
                .onErrorResume(error -> {
                    // If stats endpoint fails, try the commits endpoint with pagination
                    logger.debug("Stats endpoint failed for {}/{}, trying commits endpoint", owner, repo);
                    return getCommitCountFromCommitsEndpoint(owner, repo, accessToken);
                });
    }
    
    public Mono<String> getUserLogin(String accessToken) {
        logger.debug("Fetching user login from GitHub");
        
        return webClient.get()
                .uri("/user")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github.v3+json")
                .retrieve()
                .bodyToMono(Map.class)
                .map(user -> (String) user.get("login"))
                .onErrorReturn("");
    }
    
    @SuppressWarnings("unchecked")
    public Flux<Map<String, Object>> getUserEvents(String username, String accessToken) {
        logger.debug("Fetching user events from GitHub for: {}", username);
        
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/users/{username}/events")
                        .queryParam("per_page", "100")
                        .build(username))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github.v3+json")
                .retrieve()
                .bodyToFlux(Map.class)
                .map(event -> (Map<String, Object>) event);
    }
    
    @SuppressWarnings("unchecked")
    private Mono<Integer> getCommitCountFromCommitsEndpoint(String owner, String repo, String accessToken) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/repos/{owner}/{repo}/commits")
                        .queryParam("per_page", "1")
                        .build(owner, repo))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/vnd.github.v3+json")
                .retrieve()
                .toBodilessEntity()
                .map(response -> {
                    // Try to get count from Link header
                    String linkHeader = response.getHeaders().getFirst("Link");
                    if (linkHeader != null && linkHeader.contains("rel=\"last\"")) {
                        try {
                            String[] parts = linkHeader.split(",");
                            for (String part : parts) {
                                if (part.contains("rel=\"last\"")) {
                                    String pageStr = part.split("page=")[1].split(">")[0].split("&")[0];
                                    return Integer.parseInt(pageStr);
                                }
                            }
                        } catch (Exception e) {
                            logger.warn("Failed to parse Link header for {}/{}", owner, repo);
                        }
                    }
                    // If no pagination, there's likely just 1 page of commits
                    return 1;
                })
                .onErrorResume(error -> {
                    logger.warn("Failed to fetch commit count for {}/{}: {}", owner, repo, error.getMessage());
                    return Mono.just(0);
                });
    }
}
