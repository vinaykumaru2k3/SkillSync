package com.skillsync.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskCommentDTO {
    private UUID id;
    private UUID taskId;
    private UUID userId;
    private String username;
    private String displayName;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
