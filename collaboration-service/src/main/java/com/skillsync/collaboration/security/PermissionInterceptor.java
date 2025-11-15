package com.skillsync.collaboration.security;

import com.skillsync.collaboration.entity.Permission;
import com.skillsync.collaboration.exception.CollaborationException;
import com.skillsync.collaboration.service.PermissionService;
import com.skillsync.shared.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

@Component
public class PermissionInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(PermissionInterceptor.class);

    @Autowired
    private PermissionService permissionService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequirePermission requirePermission = handlerMethod.getMethodAnnotation(RequirePermission.class);

        if (requirePermission == null) {
            return true;
        }

        // Extract user ID from JWT token
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new CollaborationException("Authorization header is missing or invalid");
        }

        String token = authHeader.replace("Bearer ", "");
        String userIdStr = jwtUtil.extractUsername(token);
        UUID userId = UUID.fromString(userIdStr);

        // Extract project ID from request (could be path variable or request parameter)
        String projectIdStr = extractProjectId(request);
        if (projectIdStr == null) {
            throw new CollaborationException("Project ID is required for permission check");
        }

        UUID projectId = UUID.fromString(projectIdStr);
        Permission requiredPermission = requirePermission.value();

        // Check if user has the required permission
        boolean hasPermission = permissionService.checkPermission(projectId, userId, requiredPermission);

        if (!hasPermission) {
            logger.warn("User {} does not have {} permission for project {}", 
                    userId, requiredPermission, projectId);
            throw new CollaborationException("You do not have permission to perform this action");
        }

        logger.debug("User {} has {} permission for project {}", 
                userId, requiredPermission, projectId);
        return true;
    }

    private String extractProjectId(HttpServletRequest request) {
        // Try to get from path variable
        String uri = request.getRequestURI();
        String[] parts = uri.split("/");
        
        // Look for UUID pattern in URI
        for (String part : parts) {
            if (part.matches("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")) {
                return part;
            }
        }

        // Try to get from query parameter
        return request.getParameter("projectId");
    }
}
