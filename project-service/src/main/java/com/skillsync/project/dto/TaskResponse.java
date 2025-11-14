package com.skillsync.project.dto;

import com.skillsync.project.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    
    private UUID id;
    private String title;
    private String description;
    private UUID assigneeId;
    private Set<String> labels;
    private Task.TaskPriority priority;
    private Task.TaskStatus status;
    private LocalDate dueDate;
    private Integer position;
    private UUID columnId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
