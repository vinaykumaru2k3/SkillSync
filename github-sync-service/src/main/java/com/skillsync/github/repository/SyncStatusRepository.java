package com.skillsync.github.repository;

import com.skillsync.github.entity.SyncStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SyncStatusRepository extends MongoRepository<SyncStatus, String> {
    
    Optional<SyncStatus> findByUserId(String userId);
}
