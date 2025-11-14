package com.skillsync.github.mapper;

import com.skillsync.github.dto.GitHubApiRepositoryResponse;
import com.skillsync.github.dto.GitHubRepositoryDTO;
import com.skillsync.github.entity.GitHubRepository;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class GitHubRepositoryMapper {
    
    public static GitHubRepository toEntity(GitHubApiRepositoryResponse apiResponse, String userId) {
        GitHubRepository entity = new GitHubRepository();
        entity.setUserId(userId);
        entity.setGithubId(apiResponse.getId());
        entity.setName(apiResponse.getName());
        entity.setFullName(apiResponse.getFullName());
        entity.setDescription(apiResponse.getDescription());
        entity.setUrl(apiResponse.getUrl());
        entity.setHtmlUrl(apiResponse.getHtmlUrl());
        entity.setLanguage(apiResponse.getLanguage());
        entity.setStars(apiResponse.getStargazersCount());
        entity.setForks(apiResponse.getForksCount());
        entity.setIsPrivate(apiResponse.getIsPrivate());
        
        if (apiResponse.getPushedAt() != null) {
            entity.setLastCommitAt(parseGitHubDateTime(apiResponse.getPushedAt()));
        }
        
        entity.setSyncedAt(LocalDateTime.now());
        return entity;
    }
    
    public static GitHubRepositoryDTO toDTO(GitHubRepository entity) {
        GitHubRepositoryDTO dto = new GitHubRepositoryDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setGithubId(entity.getGithubId());
        dto.setName(entity.getName());
        dto.setFullName(entity.getFullName());
        dto.setDescription(entity.getDescription());
        dto.setUrl(entity.getUrl());
        dto.setHtmlUrl(entity.getHtmlUrl());
        dto.setLanguage(entity.getLanguage());
        dto.setLanguages(entity.getLanguages());
        dto.setStars(entity.getStars());
        dto.setForks(entity.getForks());
        dto.setIsPrivate(entity.getIsPrivate());
        dto.setLastCommitAt(entity.getLastCommitAt());
        dto.setSyncedAt(entity.getSyncedAt());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
    
    private static LocalDateTime parseGitHubDateTime(String dateTimeString) {
        try {
            return ZonedDateTime.parse(dateTimeString, DateTimeFormatter.ISO_DATE_TIME)
                    .toLocalDateTime();
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }
}
