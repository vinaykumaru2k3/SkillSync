package com.skillsync.feedback.service;

import com.skillsync.feedback.client.UserServiceClient;
import com.skillsync.feedback.dto.FeedbackRequest;
import com.skillsync.feedback.dto.FeedbackResponse;
import com.skillsync.feedback.dto.RatingAggregationResponse;
import com.skillsync.feedback.entity.Feedback;
import com.skillsync.feedback.entity.ModerationStatus;
import com.skillsync.feedback.entity.RatingAggregation;
import com.skillsync.feedback.exception.FeedbackException;
import com.skillsync.feedback.repository.FeedbackRepository;
import com.skillsync.feedback.repository.RatingAggregationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final RatingAggregationRepository ratingAggregationRepository;
    private final UserServiceClient userServiceClient;
    private final ModerationService moderationService;

    public FeedbackService(FeedbackRepository feedbackRepository,
                          RatingAggregationRepository ratingAggregationRepository,
                          UserServiceClient userServiceClient,
                          ModerationService moderationService) {
        this.feedbackRepository = feedbackRepository;
        this.ratingAggregationRepository = ratingAggregationRepository;
        this.userServiceClient = userServiceClient;
        this.moderationService = moderationService;
    }

    @Transactional
    public FeedbackResponse createFeedback(FeedbackRequest request, UUID authorId) {
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new FeedbackException("Rating must be between 1 and 5");
        }

        Feedback feedback = new Feedback();
        feedback.setProjectId(request.getProjectId());
        feedback.setAuthorId(authorId);
        feedback.setComment(request.getComment());
        feedback.setRating(request.getRating());
        
        if (moderationService.containsInappropriateContent(request.getComment())) {
            feedback.setModerationStatus(ModerationStatus.FLAGGED);
        } else {
            feedback.setModerationStatus(ModerationStatus.APPROVED);
        }

        feedback = feedbackRepository.save(feedback);
        updateRatingAggregation(request.getProjectId(), request.getRating(), true);
        
        return mapToResponse(feedback, authorId);
    }

    public FeedbackResponse updateFeedback(String feedbackId, FeedbackRequest request, UUID userId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
            .orElseThrow(() -> new FeedbackException("Feedback not found"));

        if (!feedback.getAuthorId().equals(userId)) {
            throw new FeedbackException("Not authorized to edit this feedback");
        }

        Duration timeSinceCreation = Duration.between(feedback.getCreatedAt(), LocalDateTime.now());
        if (timeSinceCreation.toHours() > 24) {
            throw new FeedbackException("Cannot edit feedback after 24 hours");
        }

        Integer oldRating = feedback.getRating();
        feedback.setComment(request.getComment());
        feedback.setRating(request.getRating());
        feedback.setUpdatedAt(LocalDateTime.now());
        feedback.setEdited(true);

        if (moderationService.containsInappropriateContent(request.getComment())) {
            feedback.setModerationStatus(ModerationStatus.FLAGGED);
        }

        feedback = feedbackRepository.save(feedback);
        
        if (!oldRating.equals(request.getRating())) {
            updateRatingAggregation(feedback.getProjectId(), oldRating, false);
            updateRatingAggregation(feedback.getProjectId(), request.getRating(), true);
        }

        return mapToResponse(feedback, userId);
    }

    public void deleteFeedback(String feedbackId, UUID userId, boolean isOwner) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
            .orElseThrow(() -> new FeedbackException("Feedback not found"));

        if (!feedback.getAuthorId().equals(userId) && !isOwner) {
            throw new FeedbackException("Not authorized to delete this feedback");
        }

        feedbackRepository.delete(feedback);
        updateRatingAggregation(feedback.getProjectId(), feedback.getRating(), false);
    }

    public List<FeedbackResponse> getProjectFeedback(UUID projectId, UUID currentUserId) {
        return feedbackRepository.findByProjectIdAndModerationStatus(projectId, ModerationStatus.APPROVED)
            .stream()
            .map(f -> mapToResponse(f, currentUserId))
            .collect(Collectors.toList());
    }

    public List<FeedbackResponse> getAllProjectFeedback(UUID projectId, UUID currentUserId) {
        return feedbackRepository.findByProjectId(projectId)
            .stream()
            .map(f -> mapToResponse(f, currentUserId))
            .collect(Collectors.toList());
    }

    public RatingAggregationResponse getProjectRatings(UUID projectId) {
        RatingAggregation aggregation = ratingAggregationRepository.findByProjectId(projectId)
            .orElse(new RatingAggregation());
        
        RatingAggregationResponse response = new RatingAggregationResponse();
        response.setProjectId(projectId);
        response.setAverageRating(aggregation.getAverageRating());
        response.setTotalRatings(aggregation.getTotalRatings());
        response.setRating1Count(aggregation.getRating1Count());
        response.setRating2Count(aggregation.getRating2Count());
        response.setRating3Count(aggregation.getRating3Count());
        response.setRating4Count(aggregation.getRating4Count());
        response.setRating5Count(aggregation.getRating5Count());
        
        return response;
    }

    public List<FeedbackResponse> getFlaggedFeedback() {
        return feedbackRepository.findByModerationStatus(ModerationStatus.FLAGGED)
            .stream()
            .map(f -> mapToResponse(f, null))
            .collect(Collectors.toList());
    }

    public void updateModerationStatus(String feedbackId, ModerationStatus status) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
            .orElseThrow(() -> new FeedbackException("Feedback not found"));
        
        feedback.setModerationStatus(status);
        feedbackRepository.save(feedback);
    }

    private void updateRatingAggregation(UUID projectId, Integer rating, boolean increment) {
        RatingAggregation aggregation = ratingAggregationRepository.findByProjectId(projectId)
            .orElseGet(() -> {
                RatingAggregation newAgg = new RatingAggregation();
                newAgg.setProjectId(projectId);
                return newAgg;
            });

        int delta = increment ? 1 : -1;
        
        switch (rating) {
            case 1: aggregation.setRating1Count(aggregation.getRating1Count() + delta); break;
            case 2: aggregation.setRating2Count(aggregation.getRating2Count() + delta); break;
            case 3: aggregation.setRating3Count(aggregation.getRating3Count() + delta); break;
            case 4: aggregation.setRating4Count(aggregation.getRating4Count() + delta); break;
            case 5: aggregation.setRating5Count(aggregation.getRating5Count() + delta); break;
        }

        aggregation.setTotalRatings(aggregation.getTotalRatings() + delta);
        
        if (aggregation.getTotalRatings() > 0) {
            double sum = aggregation.getRating1Count() * 1 +
                        aggregation.getRating2Count() * 2 +
                        aggregation.getRating3Count() * 3 +
                        aggregation.getRating4Count() * 4 +
                        aggregation.getRating5Count() * 5;
            aggregation.setAverageRating(sum / aggregation.getTotalRatings());
        } else {
            aggregation.setAverageRating(0.0);
        }

        ratingAggregationRepository.save(aggregation);
    }

    private FeedbackResponse mapToResponse(Feedback feedback, UUID currentUserId) {
        FeedbackResponse response = new FeedbackResponse();
        response.setId(feedback.getId());
        response.setProjectId(feedback.getProjectId());
        response.setAuthorId(feedback.getAuthorId());
        response.setComment(feedback.getComment());
        response.setRating(feedback.getRating());
        response.setModerationStatus(feedback.getModerationStatus());
        response.setCreatedAt(feedback.getCreatedAt());
        response.setUpdatedAt(feedback.getUpdatedAt());
        response.setEdited(feedback.isEdited());

        UserServiceClient.UserInfo userInfo = userServiceClient.getUserInfo(feedback.getAuthorId());
        if (userInfo != null) {
            response.setAuthorUsername(userInfo.getUsername());
            response.setAuthorDisplayName(userInfo.getDisplayName());
            response.setAuthorProfileImageUrl(userInfo.getProfileImageUrl());
        }

        if (currentUserId != null && feedback.getAuthorId().equals(currentUserId)) {
            Duration timeSinceCreation = Duration.between(feedback.getCreatedAt(), LocalDateTime.now());
            response.setCanEdit(timeSinceCreation.toHours() <= 24);
        }

        return response;
    }
}
