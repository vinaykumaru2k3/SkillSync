package com.skillsync.project.controller;

import com.skillsync.project.dto.TaskCommentDTO;
import com.skillsync.project.service.TaskCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks/{taskId}/comments")
@RequiredArgsConstructor
public class TaskCommentController {
    
    private final TaskCommentService commentService;
    
    @PostMapping
    public ResponseEntity<TaskCommentDTO> addComment(
            @PathVariable UUID taskId,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, String> request) {
        
        TaskCommentDTO comment = commentService.addComment(
                taskId, 
                UUID.fromString(userId), 
                request.get("content"));
        
        return ResponseEntity.ok(comment);
    }
    
    @GetMapping
    public ResponseEntity<List<TaskCommentDTO>> getComments(@PathVariable UUID taskId) {
        List<TaskCommentDTO> comments = commentService.getTaskComments(taskId);
        return ResponseEntity.ok(comments);
    }
    
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID taskId,
            @PathVariable UUID commentId,
            @RequestHeader("X-User-Id") String userId) {
        
        commentService.deleteComment(commentId, UUID.fromString(userId));
        return ResponseEntity.noContent().build();
    }
}
