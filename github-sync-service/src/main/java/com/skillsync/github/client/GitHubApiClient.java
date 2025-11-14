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
}
