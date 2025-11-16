package com.skillsync.project.service;

import com.skillsync.project.dto.TaskCommentDTO;
import com.skillsync.project.entity.Task;
import com.skillsync.project.entity.TaskComment;
import com.skillsync.project.repository.TaskCommentRepository;
import com.skillsync.project.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskCommentService {
    
    private static final Logger logger = LoggerFactory.getLogger(TaskCommentService.class);
    private static final Pattern MENTION_PATTERN = Pattern.compile("@([a-zA-Z0-9_]+)");
    
    private final TaskCommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final EventPublisher eventPublisher;
    private final RestTemplate restTemplate;
    
    @Transactional
    public TaskCommentDTO addComment(UUID taskId, UUID userId, String content) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        // Get project ID using query to avoid lazy loading
        UUID projectId = taskRepository.findProjectIdByTaskId(taskId)
                .orElseThrow(() -> new RuntimeException("Project not found for task"));
        
        TaskComment comment = new TaskComment();
        comment.setTask(task);
        comment.setUserId(userId);
        comment.setContent(content);
        
        TaskComment saved = commentRepository.save(comment);
        
        // Extract mentions
        Set<String> mentions = extractMentions(content);
        
        // Publish notifications
        eventPublisher.publishTaskCommentNotification(saved, task, projectId, mentions);
        
        return toDTO(saved);
    }
    
    @Transactional(readOnly = true)
    public List<TaskCommentDTO> getTaskComments(UUID taskId) {
        List<TaskComment> comments = commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
        return comments.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteComment(UUID commentId, UUID userId) {
        TaskComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }
        
        commentRepository.delete(comment);
    }
    
    private Set<String> extractMentions(String content) {
        Set<String> mentions = new HashSet<>();
        Matcher matcher = MENTION_PATTERN.matcher(content);
        while (matcher.find()) {
            mentions.add(matcher.group(1));
        }
        return mentions;
    }
    
    private TaskCommentDTO toDTO(TaskComment comment) {
        TaskCommentDTO dto = new TaskCommentDTO();
        dto.setId(comment.getId());
        dto.setTaskId(comment.getTask().getId());
        dto.setUserId(comment.getUserId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        
        // Fetch user info
        try {
            Map<String, Object> user = fetchUserInfo(comment.getUserId());
            dto.setUsername((String) user.get("username"));
            dto.setDisplayName((String) user.get("displayName"));
        } catch (Exception e) {
            logger.warn("Failed to fetch user info for userId: {}", comment.getUserId());
        }
        
        return dto;
    }
    
    private Map<String, Object> fetchUserInfo(UUID userId) {
        String url = "http://localhost:8082/api/v1/users/user/" + userId;
        return restTemplate.getForObject(url, Map.class);
    }
}
