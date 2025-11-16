# RabbitMQ Dependency Status

## Services with RabbitMQ Dependency

### ✅ notification-service
- **Status**: Already has dependency
- **Purpose**: Consumes notification events from queue
- **Configuration**: Already configured

### ✅ collaboration-service  
- **Status**: Dependency ADDED
- **Purpose**: Publishes INVITATION, INVITATION_ACCEPTED, INVITATION_DECLINED, COLLABORATION_REMOVED events
- **Action Required**: Rebuild service with `mvn clean package -DskipTests`

### ✅ project-service
- **Status**: Dependency ADDED
- **Purpose**: Publishes TASK_ASSIGNED, TASK_UPDATED, PROJECT_UPDATED events
- **Action Required**: Rebuild service with `mvn clean package -DskipTests`

### ✅ feedback-service
- **Status**: Dependencies ADDED (RabbitMQ + Lombok)
- **Purpose**: Publishes FEEDBACK_RECEIVED events
- **Action Required**: Rebuild service with `mvn clean package -DskipTests`

## Services WITHOUT RabbitMQ Dependency (Not Needed)

### ❌ user-service
- **Reason**: Does not publish notification events
- **Role**: Provides user information via REST API

### ❌ auth-service
- **Reason**: Does not publish notification events
- **Role**: Handles authentication and JWT tokens

### ❌ github-sync-service
- **Reason**: Does not publish notification events (yet)
- **Role**: Syncs GitHub repositories

### ❌ api-gateway
- **Reason**: Only routes requests, does not publish events
- **Role**: API Gateway and routing

## Rebuild Commands

Run these commands to rebuild services with new RabbitMQ dependency:

```bash
# Collaboration Service
cd collaboration-service
mvn clean package -DskipTests

# Project Service
cd ../project-service
mvn clean package -DskipTests

# Feedback Service
cd ../feedback-service
mvn clean package -DskipTests
```

## Docker Compose Restart

After rebuilding, restart the services:

```bash
docker-compose restart collaboration-service project-service feedback-service
```

Or if running locally, restart each service individually.

## Verification

After restart, check logs for:
- `RabbitTemplate` bean creation
- Connection to RabbitMQ on startup
- Successful event publishing when actions occur
