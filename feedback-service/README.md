# Feedback Service

Feedback and Review Management Service for SkillSync Platform.

## Features

- ✅ Feedback submission with 1-5 star ratings
- ✅ Rating aggregation and analytics
- ✅ Time-based edit constraints (24 hours)
- ✅ Automated content moderation
- ✅ User profile enrichment
- ✅ Admin moderation queue

## Prerequisites

- Java 17+
- Maven 3.6+
- MongoDB running on localhost:27017

## Quick Start

### 1. Start MongoDB

```bash
docker-compose up -d mongodb
```

### 2. Build the Service

```bash
mvn clean package -DskipTests
```

### 3. Run the Service

```bash
mvn spring-boot:run
```

The service will start on port 8086.

## API Endpoints

### Public Endpoints

- `GET /api/v1/feedback/project/{projectId}` - Get approved feedback for a project
- `GET /api/v1/feedback/project/{projectId}/ratings` - Get rating statistics

### Authenticated Endpoints

- `POST /api/v1/feedback` - Submit feedback
- `PUT /api/v1/feedback/{feedbackId}` - Update feedback (within 24 hours)
- `DELETE /api/v1/feedback/{feedbackId}` - Delete feedback

### Admin Endpoints

- `GET /api/v1/feedback/moderation/flagged` - Get flagged content
- `PUT /api/v1/feedback/{feedbackId}/moderation` - Update moderation status

## Configuration

### Environment Variables

- `JWT_SECRET` - JWT signing secret (default: provided in application.yml)
- `MONGO_URI` - MongoDB connection string

### Profiles

- `default` - Local development (localhost MongoDB)
- `docker` - Docker environment (mongodb container)

## Database

### Collections

1. **feedbacks**
   - Stores all feedback submissions
   - Fields: id, projectId, authorId, comment, rating, moderationStatus, createdAt, updatedAt, edited

2. **rating_aggregations**
   - Stores rating statistics per project
   - Fields: projectId, averageRating, totalRatings, rating1Count-rating5Count

## Content Moderation

The service automatically flags feedback containing inappropriate content:
- Spam keywords
- Offensive language
- Fraudulent content indicators

Flagged content is hidden from public view and queued for admin review.

## Integration

### With User Service

Fetches user profile information to enrich feedback responses:
- Username
- Display name
- Profile image URL

### With Notification Service (Future)

Triggers notification events:
- New feedback submitted
- Feedback edited
- Feedback flagged for moderation

## Health Check

```bash
curl http://localhost:8086/actuator/health
```

## Testing

```bash
# Run unit tests
mvn test

# Run with coverage
mvn test jacoco:report
```

## Docker

```bash
# Build image
docker build -t skillsync/feedback-service .

# Run container
docker run -p 8086:8086 \
  -e MONGO_URI=mongodb://mongodb:27017/skillsync \
  skillsync/feedback-service
```

## Documentation

See [FEEDBACK_SERVICE_IMPLEMENTATION.md](../Docs/FEEDBACK_SERVICE_IMPLEMENTATION.md) for detailed implementation documentation.
