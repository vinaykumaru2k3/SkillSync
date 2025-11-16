# Notification Service

Real-time notification and messaging service for SkillSync platform.

## Features

- **Real-time WebSocket Notifications**: Instant delivery via STOMP over WebSocket
- **Email Notifications**: Fallback email delivery for offline users
- **Event-Driven Architecture**: RabbitMQ message consumers for notification events
- **User Preferences**: Configurable delivery channels per notification type
- **Notification History**: Redis-based storage with read/unread tracking
- **Retry Logic**: Exponential backoff for failed email deliveries

## Architecture

### Entities
- **Notification**: Stores notification data with read status
- **NotificationPreference**: User-specific delivery preferences
- **NotificationType**: Enum for different notification categories
- **DeliveryChannel**: WEBSOCKET, EMAIL, BOTH, NONE

### Services
- **NotificationService**: Core notification processing and routing
- **WebSocketService**: Real-time message delivery and connection management
- **EmailService**: Email delivery with retry mechanism
- **UserService**: Fetches user email addresses from User Service

### Event Processing
- Consumes events from `notification.queue` via RabbitMQ
- Routes notifications based on user preferences
- Sends WebSocket messages to connected clients
- Sends emails to offline users

## API Endpoints

### Get Notifications
```
GET /api/v1/notifications
Headers: X-User-Id: {userId}
```

### Get Unread Notifications
```
GET /api/v1/notifications/unread
Headers: X-User-Id: {userId}
```

### Get Unread Count
```
GET /api/v1/notifications/unread/count
Headers: X-User-Id: {userId}
```

### Mark as Read
```
PUT /api/v1/notifications/{notificationId}/read
Headers: X-User-Id: {userId}
```

### Mark All as Read
```
PUT /api/v1/notifications/read-all
Headers: X-User-Id: {userId}
```

### Get Preferences
```
GET /api/v1/notifications/preferences
Headers: X-User-Id: {userId}
```

### Update Preferences
```
PUT /api/v1/notifications/preferences
Headers: X-User-Id: {userId}
Body: NotificationPreference
```

## WebSocket Connection

### Endpoint
```
ws://localhost:8087/ws
```

### Subscribe to Notifications
```
/user/queue/notifications
```

### Heartbeat
```
/app/heartbeat
```

## Configuration

### Environment Variables
- `MAIL_HOST`: SMTP server host
- `MAIL_PORT`: SMTP server port
- `MAIL_USERNAME`: Email username
- `MAIL_PASSWORD`: Email password
- `JWT_SECRET`: JWT signing secret

### Redis
- Host: localhost:6379 (local) / redis (docker)
- Used for notification storage and user preferences

### RabbitMQ
- Host: localhost:5672 (local) / rabbitmq (docker)
- Exchange: notification.exchange
- Queue: notification.queue
- Routing Key: notification.#

## Notification Types

- **INVITATION**: Collaboration invitation received
- **INVITATION_ACCEPTED**: Invitation accepted by collaborator
- **INVITATION_DECLINED**: Invitation declined by collaborator
- **TASK_ASSIGNED**: Task assigned to user
- **TASK_UPDATED**: Task updated on project board
- **TASK_COMMENT**: Comment added to task
- **MENTION**: User mentioned in comment
- **FEEDBACK_RECEIVED**: Feedback received on project
- **PROJECT_UPDATED**: Project details updated
- **COLLABORATION_REMOVED**: Collaborator access revoked

## Publishing Notification Events

Other services can publish notification events to RabbitMQ:

```java
NotificationEvent event = new NotificationEvent();
event.setUserId("user-id");
event.setType(NotificationType.FEEDBACK_RECEIVED);
event.setTitle("New Feedback");
event.setMessage("You received feedback on your project");
event.setActionUrl("/projects/123");

rabbitTemplate.convertAndSend("notification.exchange", "notification.event", event);
```

## Running the Service

### Local Development
```bash
mvn spring-boot:run
```

### Docker
```bash
docker-compose up notification-service
```

## Dependencies

- Spring Boot WebSocket
- Spring Boot AMQP (RabbitMQ)
- Spring Boot Mail
- Spring Data Redis
- STOMP Protocol
