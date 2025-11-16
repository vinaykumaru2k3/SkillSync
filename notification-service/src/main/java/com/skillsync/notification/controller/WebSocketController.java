package com.skillsync.notification.controller;

import com.skillsync.notification.service.WebSocketService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class WebSocketController {
    
    private final WebSocketService webSocketService;
    
    public WebSocketController(WebSocketService webSocketService) {
        this.webSocketService = webSocketService;
    }
    
    @SubscribeMapping("/queue/notifications")
    public void onSubscribe(Principal principal) {
        if (principal != null) {
            webSocketService.registerConnection(principal.getName());
        }
    }
    
    @MessageMapping("/heartbeat")
    public void handleHeartbeat(@Payload String userId) {
        webSocketService.sendHeartbeat(userId);
    }
}
