package com.skillsync.project.service;

import com.skillsync.project.client.CollaborationServiceClient;
import com.skillsync.project.dto.*;
import com.skillsync.project.entity.BoardColumn;
import com.skillsync.project.entity.Project;
import com.skillsync.project.entity.Task;
import com.skillsync.project.repository.BoardColumnRepository;
import com.skillsync.project.repository.ProjectRepository;
import com.skillsync.project.repository.TaskRepository;
import com.skillsync.project.specification.ProjectSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final TaskRepository taskRepository;
    private final CollaborationServiceClient collaborationServiceClient;
    private final com.skillsync.project.client.UserServiceClient userServiceClient;
    
    @Transactional
    public ProjectResponse createProject(UUID ownerId, ProjectRequest request) {
        log.debug("Creating project for owner: {}", ownerId);
        
        Project project = new Project();
        project.setOwnerId(ownerId);
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setVisibility(request.getVisibility());
        project.setTags(request.getTags());
        project.setTechnologies(request.getTechnologies());
        project.setRepositoryUrl(request.getRepositoryUrl());
        
        // Create default board columns
        createDefaultColumns(project);
        
        Project savedProject = projectRepository.save(project);
        log.info("Project created with ID: {}", savedProject.getId());
        
        return mapToProjectResponse(savedProject);
    }
    
    private void createDefaultColumns(Project project) {
        String[] defaultColumnNames = {"To Do", "In Progress", "Done"};
        for (int i = 0; i < defaultColumnNames.length; i++) {
            BoardColumn column = new BoardColumn();
            column.setName(defaultColumnNames[i]);
            column.setPosition(i);
            project.addColumn(column);
        }
    }
    
    @Transactional(readOnly = true)
    public ProjectResponse getProject(UUID projectId) {
        log.debug("Fetching project: {}", projectId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));
        return mapToProjectResponse(project);
    }
    
    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsByOwner(UUID ownerId) {
        log.debug("Fetching projects for owner: {}", ownerId);
        return projectRepository.findByOwnerId(ownerId).stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, List<ProjectResponse>> getMyProjects(UUID userId) {
        log.debug("Fetching all projects for user: {}", userId);
        
        Map<String, List<ProjectResponse>> result = new HashMap<>();
        
        // Get owned projects
        List<ProjectResponse> ownedProjects = projectRepository.findByOwnerId(userId).stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
        result.put("owned", ownedProjects);
        
        // Get collaborated projects
        List<UUID> collaboratedProjectIds = collaborationServiceClient.getCollaboratedProjectIds(userId);
        List<ProjectResponse> collaboratedProjects = projectRepository.findAllById(collaboratedProjectIds).stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
        result.put("collaborated", collaboratedProjects);
        
        return result;
    }
    
    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllPublicProjects() {
        log.debug("Fetching all public projects");
        return projectRepository.findByVisibility(Project.ProjectVisibility.PUBLIC).stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ProjectResponse updateProject(UUID projectId, UUID userId, ProjectRequest request) {
        log.debug("Updating project: {}", projectId);
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));
        
        // Check if user is owner or has write permission
        boolean isOwner = project.getOwnerId().equals(userId);
        boolean hasWritePermission = collaborationServiceClient.hasWritePermission(projectId, userId);
        
        if (!isOwner && !hasWritePermission) {
            throw new RuntimeException("User does not have permission to update this project");
        }
        
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setVisibility(request.getVisibility());
        project.setTags(request.getTags());
        project.setTechnologies(request.getTechnologies());
        project.setRepositoryUrl(request.getRepositoryUrl());
        
        Project updatedProject = projectRepository.save(project);
        log.info("Project updated: {}", projectId);
        
        return mapToProjectResponse(updatedProject);
    }
    
    @Transactional
    public void deleteProject(UUID projectId, UUID ownerId) {
        log.debug("Deleting project: {}", projectId);
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with ID: " + projectId));
        
        if (!project.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("User is not the owner of this project");
        }
        
        projectRepository.delete(project);
        log.info("Project deleted: {}", projectId);
    }
    
    @Transactional(readOnly = true)
    public List<ProjectResponse> searchProjects(String searchTerm, Set<String> tags, Set<String> technologies) {
        log.debug("Searching projects with term: {}, tags: {}, technologies: {}", searchTerm, tags, technologies);
        
        Specification<Project> spec = ProjectSpecification.searchProjects(searchTerm, tags, technologies);
        List<Project> projects = projectRepository.findAll(spec);
        
        return projects.stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ProjectResponse> discoverProjects() {
        log.debug("Discovering public projects");
        return getAllPublicProjects();
    }
    
    private ProjectResponse mapToProjectResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setOwnerId(project.getOwnerId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setVisibility(project.getVisibility());
        response.setTags(project.getTags());
        response.setTechnologies(project.getTechnologies());
        response.setRepositoryUrl(project.getRepositoryUrl());
        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());
        
        List<BoardColumnResponse> columnResponses = project.getColumns().stream()
                .map(this::mapToBoardColumnResponse)
                .collect(Collectors.toList());
        response.setColumns(columnResponses);
        
        return response;
    }
    
    private BoardColumnResponse mapToBoardColumnResponse(BoardColumn column) {
        BoardColumnResponse response = new BoardColumnResponse();
        response.setId(column.getId());
        response.setName(column.getName());
        response.setPosition(column.getPosition());
        
        List<TaskResponse> taskResponses = column.getTasks().stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
        response.setTasks(taskResponses);
        
        return response;
    }
    
    private TaskResponse mapToTaskResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setAssigneeId(task.getAssigneeId());
        response.setCreatorId(task.getCreatorId());
        response.setLabels(task.getLabels());
        response.setPriority(task.getPriority());
        response.setStatus(task.getStatus());
        response.setDueDate(task.getDueDate());
        response.setPosition(task.getPosition());
        response.setColumnId(task.getColumn().getId());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        
        if (task.getCreatorId() != null) {
            try {
                com.skillsync.project.client.UserServiceClient.UserInfo userInfo = userServiceClient.getUserInfo(task.getCreatorId());
                response.setCreatorUsername(userInfo.getUsername());
                response.setCreatorProfileImageUrl(userInfo.getProfileImageUrl());
            } catch (Exception e) {
                log.warn("Failed to fetch creator info for task {}: {}", task.getId(), e.getMessage());
            }
        }
        
        return response;
    }
}
