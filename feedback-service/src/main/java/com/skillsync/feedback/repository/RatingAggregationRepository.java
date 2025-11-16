package com.skillsync.feedback.repository;

import com.skillsync.feedback.entity.RatingAggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.UUID;

public interface RatingAggregationRepository extends MongoRepository<RatingAggregation, String> {
    Optional<RatingAggregation> findByProjectId(UUID projectId);
}
