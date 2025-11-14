package com.skillsync.project.dto;

import com.skillsync.project.entity.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    
    @NotBlank(message = "Task title is required")
    private String title;
    
    private String description;
    
    private UUID assigneeId;
    
    private Set<String> labels;
    
    @NotNull(message = "Priority is required")
    private Task.TaskPriority priority;
    
    @NotNull(message = "Status is required")
    private Task.TaskStatus status;
    
    private LocalDate dueDate;
    
    @NotNull(message = "Column ID is required")
    private UUID columnId;
}
