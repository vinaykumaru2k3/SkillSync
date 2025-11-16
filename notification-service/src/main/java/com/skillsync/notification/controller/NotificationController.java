package com.skillsync.notification.controller;

import com.skillsync.notification.dto.NotificationResponse;
import com.skillsync.notification.entity.NotificationPreference;
import com.skillsync.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    
    private final NotificationService notificationService;
    
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }
    
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }
    
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }
    
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable String notificationId,
            @RequestHeader("X-User-Id") String userId) {
        notificationService.markAsRead(notificationId, userId);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestHeader("X-User-Id") String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreference> getPreferences(
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(notificationService.getUserPreferences(userId));
    }
    
    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreference> updatePreferences(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody NotificationPreference preferences) {
        return ResponseEntity.ok(notificationService.updatePreferences(userId, preferences));
    }
    
    @DeleteMapping
    public ResponseEntity<Void> clearAllNotifications(@RequestHeader("X-User-Id") String userId) {
        notificationService.clearAllNotifications(userId);
        return ResponseEntity.ok().build();
    }
}
