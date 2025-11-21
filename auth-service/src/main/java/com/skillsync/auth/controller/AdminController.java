package com.skillsync.auth.controller;

import com.skillsync.auth.entity.User;
import com.skillsync.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{userId}/roles")
    public ResponseEntity<?> addRole(@PathVariable UUID userId, @RequestBody RoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.getRoles().add(request.getRole());
        userRepository.save(user);

        return ResponseEntity.ok(new RoleResponse(user.getId(), user.getRoles()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/users/{userId}/roles/{role}")
    public ResponseEntity<?> removeRole(@PathVariable UUID userId, @PathVariable String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.getRoles().remove(role);
        userRepository.save(user);

        return ResponseEntity.ok(new RoleResponse(user.getId(), user.getRoles()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/{userId}/roles")
    public ResponseEntity<?> getUserRoles(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new RoleResponse(user.getId(), user.getRoles()));
    }

    // DTOs
    public static class RoleRequest {
        private String role;

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }

    public static class RoleResponse {
        private UUID userId;
        private Set<String> roles;

        public RoleResponse(UUID userId, Set<String> roles) {
            this.userId = userId;
            this.roles = roles;
        }

        public UUID getUserId() {
            return userId;
        }

        public Set<String> getRoles() {
            return roles;
        }
    }
}
