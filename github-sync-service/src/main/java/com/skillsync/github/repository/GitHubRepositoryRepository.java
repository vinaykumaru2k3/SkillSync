package com.skillsync.github.repository;

import com.skillsync.github.entity.GitHubRepository;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GitHubRepositoryRepository extends MongoRepository<GitHubRepository, String> {
    
    List<GitHubRepository> findByUserId(String userId);
    
    Optional<GitHubRepository> findByUserIdAndGithubId(String userId, Long githubId);
    
    void deleteByUserId(String userId);
}
