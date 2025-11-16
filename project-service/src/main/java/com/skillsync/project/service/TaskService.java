package com.skillsync.project.service;

import com.skillsync.project.client.UserServiceClient;
import com.skillsync.project.dto.TaskMoveRequest;
import com.skillsync.project.dto.TaskRequest;
import com.skillsync.project.dto.TaskResponse;
import com.skillsync.project.entity.BoardColumn;
import com.skillsync.project.entity.Task;
import com.skillsync.project.repository.BoardColumnRepository;
import com.skillsync.project.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final BoardColumnRepository boardColumnRepository;
    private final UserServiceClient userServiceClient;
    private final EventPublisher eventPublisher;
    
    @Transactional
    public TaskResponse createTask(UUID creatorId, TaskRequest request) {
        log.debug("Creating task in column: {}", request.getColumnId());
        
        BoardColumn column = boardColumnRepository.findById(request.getColumnId())
                .orElseThrow(() -> new RuntimeException("Column not found with ID: " + request.getColumnId()));
        
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setAssigneeId(request.getAssigneeId());
        task.setCreatorId(creatorId);
        task.setLabels(request.getLabels());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        task.setPosition(column.getTasks().size());
        column.addTask(task);
        
        Task savedTask = taskRepository.save(task);
        log.info("Task created with ID: {}", savedTask.getId());
        
        if (savedTask.getAssigneeId() != null) {
            eventPublisher.publishTaskAssigned(savedTask, column.getProject());
        }
        
        return mapToTaskResponse(savedTask);
    }
    
    @Transactional(readOnly = true)
    public TaskResponse getTask(UUID taskId) {
        log.debug("Fetching task: {}", taskId);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + taskId));
        return mapToTaskResponse(task);
    }
    
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByColumn(UUID columnId) {
        log.debug("Fetching tasks for column: {}", columnId);
        return taskRepository.findByColumnIdOrderByPositionAsc(columnId).stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByProject(UUID projectId) {
        log.debug("Fetching tasks for project: {}", projectId);
        return taskRepository.findByColumnProjectId(projectId).stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public TaskResponse updateTask(UUID taskId, TaskRequest request, UUID userId) {
        log.debug("Updating task: {}", taskId);
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + taskId));
        
        UUID oldAssigneeId = task.getAssigneeId();
        
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setAssigneeId(request.getAssigneeId());
        task.setLabels(request.getLabels());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        
        Task updatedTask = taskRepository.save(task);
        log.info("Task updated: {}", taskId);
        
        if (request.getAssigneeId() != null && !request.getAssigneeId().equals(oldAssigneeId)) {
            eventPublisher.publishTaskAssigned(updatedTask, task.getColumn().getProject());
        } else {
            eventPublisher.publishTaskUpdated(updatedTask, task.getColumn().getProject(), userId);
        }
        
        return mapToTaskResponse(updatedTask);
    }
    
    @Transactional
    public TaskResponse moveTask(UUID taskId, TaskMoveRequest request) {
        log.debug("Moving task {} to column {}", taskId, request.getTargetColumnId());
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + taskId));
        
        BoardColumn targetColumn = boardColumnRepository.findById(request.getTargetColumnId())
                .orElseThrow(() -> new RuntimeException("Column not found with ID: " + request.getTargetColumnId()));
        
        UUID sourceColumnId = task.getColumn().getId();
        
        // Simply update the task's column reference and position
        task.setColumn(targetColumn);
        task.setPosition(request.getPosition());
        
        Task movedTask = taskRepository.save(task);
        
        // Reorder tasks in both columns after the move
        if (!sourceColumnId.equals(request.getTargetColumnId())) {
            reorderTasksInColumn(sourceColumnId);
        }
        reorderTasksInColumn(request.getTargetColumnId());
        
        log.info("Task moved: {}", taskId);
        
        return mapToTaskResponse(movedTask);
    }
    
    @Transactional
    public void deleteTask(UUID taskId) {
        log.debug("Deleting task: {}", taskId);
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + taskId));
        
        BoardColumn column = task.getColumn();
        column.removeTask(task);
        
        taskRepository.delete(task);
        
        // Reorder remaining tasks
        reorderTasks(column);
        
        log.info("Task deleted: {}", taskId);
    }
    
    private void reorderTasks(BoardColumn column) {
        List<Task> tasks = column.getTasks();
        for (int i = 0; i < tasks.size(); i++) {
            tasks.get(i).setPosition(i);
        }
    }
    
    private void reorderTasksInColumn(UUID columnId) {
        List<Task> tasks = taskRepository.findByColumnIdOrderByPositionAsc(columnId);
        for (int i = 0; i < tasks.size(); i++) {
            if (tasks.get(i).getPosition() != i) {
                tasks.get(i).setPosition(i);
                taskRepository.save(tasks.get(i));
            }
        }
    }
    
    private TaskResponse mapToTaskResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setAssigneeId(task.getAssigneeId());
        response.setCreatorId(task.getCreatorId());
        
        log.info("Fetching creator info for user ID: {}", task.getCreatorId());
        UserServiceClient.UserInfo creatorInfo = userServiceClient.getUserInfo(task.getCreatorId());
        log.info("Creator info received - username: {}, profileImageUrl: {}", 
                creatorInfo.getUsername(), creatorInfo.getProfileImageUrl());
        response.setCreatorUsername(creatorInfo.getUsername());
        response.setCreatorProfileImageUrl(creatorInfo.getProfileImageUrl());
        
        response.setLabels(task.getLabels());
        response.setPriority(task.getPriority());
        response.setStatus(task.getStatus());
        response.setDueDate(task.getDueDate());
        response.setPosition(task.getPosition());
        response.setColumnId(task.getColumn().getId());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        return response;
    }
}
