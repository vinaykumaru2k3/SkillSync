package com.skillsync.feedback.controller;

import com.skillsync.feedback.dto.FeedbackRequest;
import com.skillsync.feedback.dto.FeedbackResponse;
import com.skillsync.feedback.dto.RatingAggregationResponse;
import com.skillsync.feedback.entity.ModerationStatus;
import com.skillsync.feedback.service.FeedbackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/feedback")
public class FeedbackController {
    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public ResponseEntity<FeedbackResponse> createFeedback(
            @RequestBody FeedbackRequest request,
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(feedbackService.createFeedback(request, userId));
    }

    @PutMapping("/{feedbackId}")
    public ResponseEntity<FeedbackResponse> updateFeedback(
            @PathVariable String feedbackId,
            @RequestBody FeedbackRequest request,
            @RequestHeader("X-User-Id") UUID userId) {
        return ResponseEntity.ok(feedbackService.updateFeedback(feedbackId, request, userId));
    }

    @DeleteMapping("/{feedbackId}")
    public ResponseEntity<Void> deleteFeedback(
            @PathVariable String feedbackId,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam(required = false, defaultValue = "false") boolean isOwner) {
        feedbackService.deleteFeedback(feedbackId, userId, isOwner);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<FeedbackResponse>> getProjectFeedback(
            @PathVariable UUID projectId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        List<FeedbackResponse> feedback = feedbackService.getProjectFeedback(projectId, userId);
        System.out.println("Fetching feedback for project: " + projectId + ", found: " + feedback.size());
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/project/{projectId}/all")
    public ResponseEntity<List<FeedbackResponse>> getAllProjectFeedback(
            @PathVariable UUID projectId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.ok(feedbackService.getAllProjectFeedback(projectId, userId));
    }

    @GetMapping("/project/{projectId}/ratings")
    public ResponseEntity<RatingAggregationResponse> getProjectRatings(@PathVariable UUID projectId) {
        return ResponseEntity.ok(feedbackService.getProjectRatings(projectId));
    }

    @GetMapping("/moderation/flagged")
    public ResponseEntity<List<FeedbackResponse>> getFlaggedFeedback() {
        return ResponseEntity.ok(feedbackService.getFlaggedFeedback());
    }

    @PutMapping("/{feedbackId}/moderation")
    public ResponseEntity<Void> updateModerationStatus(
            @PathVariable String feedbackId,
            @RequestParam ModerationStatus status) {
        feedbackService.updateModerationStatus(feedbackId, status);
        return ResponseEntity.ok().build();
    }
}
