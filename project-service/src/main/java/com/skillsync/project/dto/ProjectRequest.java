package com.skillsync.project.dto;

import com.skillsync.project.entity.Project;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequest {
    
    @NotBlank(message = "Project name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Visibility is required")
    private Project.ProjectVisibility visibility;
    
    private Set<String> tags;
    
    private Set<String> technologies;
    
    private String repositoryUrl;
}
