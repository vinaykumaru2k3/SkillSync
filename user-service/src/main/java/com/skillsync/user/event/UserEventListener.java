package com.skillsync.user.event;

import com.skillsync.shared.events.UserCreatedEvent;
import com.skillsync.user.config.RabbitMQConfig;
import com.skillsync.user.service.UserProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class UserEventListener {

    private static final Logger logger = LoggerFactory.getLogger(UserEventListener.class);

    private final UserProfileService userProfileService;

    public UserEventListener(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @RabbitListener(queues = RabbitMQConfig.USER_QUEUE)
    public void handleUserCreatedEvent(UserCreatedEvent event) {
        logger.info("Received UserCreatedEvent for userId: {}", event.getUserId());
        try {
            userProfileService.createDefaultProfile(UUID.fromString(event.getUserId()));
            logger.info("Created default profile for userId: {}", event.getUserId());
        } catch (Exception e) {
            logger.error("Error creating default profile for userId: {}", event.getUserId(), e);
        }
    }
}
