package com.skillsync.project.controller;

import com.skillsync.project.dto.TaskMoveRequest;
import com.skillsync.project.dto.TaskRequest;
import com.skillsync.project.dto.TaskResponse;
import com.skillsync.project.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Slf4j
public class TaskController {
    
    private final TaskService taskService;
    
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @RequestHeader(value = "X-User-Id") UUID userId,
            @Valid @RequestBody TaskRequest request) {
        log.info("Creating task in column: {}", request.getColumnId());
        TaskResponse response = taskService.createTask(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTask(@PathVariable("taskId") UUID taskId) {
        log.info("Fetching task: {}", taskId);
        TaskResponse response = taskService.getTask(taskId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/column/{columnId}")
    public ResponseEntity<List<TaskResponse>> getTasksByColumn(@PathVariable("columnId") UUID columnId) {
        log.info("Fetching tasks for column: {}", columnId);
        List<TaskResponse> tasks = taskService.getTasksByColumn(columnId);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskResponse>> getTasksByProject(@PathVariable("projectId") UUID projectId) {
        log.info("Fetching tasks for project: {}", projectId);
        List<TaskResponse> tasks = taskService.getTasksByProject(projectId);
        return ResponseEntity.ok(tasks);
    }
    
    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @RequestHeader(value = "X-User-Id") UUID userId,
            @PathVariable("taskId") UUID taskId,
            @Valid @RequestBody TaskRequest request) {
        log.info("Updating task: {}", taskId);
        TaskResponse response = taskService.updateTask(taskId, request, userId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{taskId}/move")
    public ResponseEntity<TaskResponse> moveTask(
            @PathVariable("taskId") UUID taskId,
            @Valid @RequestBody TaskMoveRequest request) {
        log.info("Moving task: {}", taskId);
        TaskResponse response = taskService.moveTask(taskId, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable("taskId") UUID taskId) {
        log.info("Deleting task: {}", taskId);
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
}
