package com.skillsync.github.repository;

import com.skillsync.github.entity.CommitActivity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommitActivityRepository extends MongoRepository<CommitActivity, String> {
    
    List<CommitActivity> findByUserIdAndDateBetween(String userId, LocalDate startDate, LocalDate endDate);
    
    Optional<CommitActivity> findByUserIdAndDate(String userId, LocalDate date);
    
    List<CommitActivity> findByUserId(String userId);
}
