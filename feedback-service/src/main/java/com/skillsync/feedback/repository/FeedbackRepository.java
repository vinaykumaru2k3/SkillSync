package com.skillsync.feedback.repository;

import com.skillsync.feedback.entity.Feedback;
import com.skillsync.feedback.entity.ModerationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.UUID;

public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    List<Feedback> findByProjectId(UUID projectId);
    List<Feedback> findByAuthorId(UUID authorId);
    List<Feedback> findByModerationStatus(ModerationStatus status);
    List<Feedback> findByProjectIdAndModerationStatus(UUID projectId, ModerationStatus status);
}
