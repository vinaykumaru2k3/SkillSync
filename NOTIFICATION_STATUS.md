# Notification System Status

## Implemented Notification Types (7/10)

### ✅ Collaboration Notifications (4/4)
1. **INVITATION** - When someone invites you to collaborate on a project
   - Service: `collaboration-service`
   - Trigger: `CollaborationService.createInvitation()`
   - Message: "[Inviter Name] invited you to collaborate on [Project Name]"
   - Action URL: `/collaborations`

2. **INVITATION_ACCEPTED** - When someone accepts your collaboration invitation
   - Service: `collaboration-service`
   - Trigger: `CollaborationService.acceptInvitation()`
   - Message: "[Invitee Name] accepted your invitation to [Project Name]"
   - Action URL: `/projects/{projectId}`

3. **INVITATION_DECLINED** - When someone declines your invitation
   - Service: `collaboration-service`
   - Trigger: `CollaborationService.declineInvitation()`
   - Message: "[Decliner Name] declined your invitation to [Project Name]"
   - Action URL: `/projects/{projectId}`

4. **COLLABORATION_REMOVED** - When you're removed from a project
   - Service: `collaboration-service`
   - Trigger: `CollaborationService.revokeCollaboration()`
   - Message: "You have been removed from [Project Name]"
   - Action URL: `/projects`

### ✅ Task/Project Notifications (3/4)
5. **TASK_ASSIGNED** - When a task is assigned to you
   - Service: `project-service`
   - Trigger: `TaskService.createTask()` or `TaskService.updateTask()` (when assignee changes)
   - Message: "You have been assigned to task: [Task Title]"
   - Action URL: `/projects/{projectId}`

6. **TASK_UPDATED** - When a task you're involved with is updated
   - Service: `project-service`
   - Trigger: `TaskService.updateTask()` (when assignee is notified of changes)
   - Message: "Task \"[Task Title]\" has been updated"
   - Action URL: `/projects/{projectId}`

7. **PROJECT_UPDATED** - When project details are changed
   - Service: `project-service`
   - Trigger: `ProjectService.updateProject()` (notifies owner if someone else updates)
   - Message: "Project \"[Project Name]\" has been updated"
   - Action URL: `/projects/{projectId}`

### ✅ Feedback Notifications (1/1)
8. **FEEDBACK_RECEIVED** - When someone leaves feedback on your project
   - Service: `feedback-service`
   - Trigger: `FeedbackService.createFeedback()`
   - Message: "[Author Name] left a [Rating]-star review on [Project Name]"
   - Action URL: `/projects/{projectId}`

## Not Yet Implemented (2/10)

### ❌ Task Comments (1/4)
9. **TASK_COMMENT** - When someone comments on a task
   - Status: Feature not implemented yet
   - Required: Task comment entity, repository, service, and controller
   - Would trigger: When a comment is added to a task the user is assigned to or created

### ❌ Mention Notifications (1/1)
10. **MENTION** - When someone mentions you in a comment
   - Status: Feature not implemented yet
   - Required: Comment parsing for @mentions, mention detection logic
   - Would trigger: When a user is @mentioned in any comment (task, project, feedback)

## Technical Implementation

### Services with RabbitMQ Integration
- ✅ `collaboration-service` - Has RabbitMQ, publishes 4 notification types
- ✅ `project-service` - RabbitMQ added, publishes 3 notification types
- ✅ `feedback-service` - RabbitMQ added, publishes 1 notification type
- ✅ `notification-service` - Consumes all notification events

### Event Flow
1. Service publishes notification event to `notification.exchange` with routing key `notification.event`
2. `notification-service` consumes event from `notification.queue`
3. `NotificationService` routes notification based on user preferences
4. Delivers via WebSocket (if online) and/or Email (based on preferences)
5. Stores notification in Redis for persistence

### Default Delivery Preferences
- **BOTH** (WebSocket + Email): INVITATION, TASK_ASSIGNED, MENTION, FEEDBACK_RECEIVED, COLLABORATION_REMOVED
- **WEBSOCKET** only: INVITATION_ACCEPTED, INVITATION_DECLINED, TASK_UPDATED, TASK_COMMENT, PROJECT_UPDATED

## Next Steps

To complete the notification system:

1. **Implement Task Comments**
   - Create `Comment` entity in project-service
   - Add comment CRUD operations
   - Publish TASK_COMMENT notifications when comments are added
   - Notify task assignee and creator

2. **Implement Mention Detection**
   - Add mention parsing logic (detect @username patterns)
   - Resolve usernames to user IDs
   - Publish MENTION notifications when users are mentioned
   - Apply to task comments, project descriptions, feedback comments

3. **Testing**
   - Restart all services to load new RabbitMQ configurations
   - Test each notification type end-to-end
   - Verify WebSocket delivery for online users
   - Verify email delivery for offline users or email preferences
   - Test notification preferences management

## Configuration Required

### Environment Variables
All services need RabbitMQ connection details (already configured in docker-compose):
- `RABBITMQ_HOST=rabbitmq` (or `localhost` for local development)
- `RABBITMQ_PORT=5672`
- `RABBITMQ_USERNAME=skillsync`
- `RABBITMQ_PASSWORD=skillsync123`

### Service Restart Required
After adding RabbitMQ dependencies and event publishers, restart:
- `project-service`
- `feedback-service`
- `collaboration-service` (if not already restarted)
