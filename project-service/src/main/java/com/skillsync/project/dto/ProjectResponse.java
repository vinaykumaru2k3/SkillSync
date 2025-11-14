package com.skillsync.project.dto;

import com.skillsync.project.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    
    private UUID id;
    private UUID ownerId;
    private String name;
    private String description;
    private Project.ProjectVisibility visibility;
    private Set<String> tags;
    private Set<String> technologies;
    private String repositoryUrl;
    private List<BoardColumnResponse> columns;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
