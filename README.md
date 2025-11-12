# SkillSync Platform

A developer-centric platform that combines portfolio building with lightweight collaboration tools. Built as a suite of independently deployable Spring Boot microservices.

## Architecture

The platform consists of the following microservices:

- **API Gateway** (Port 8080) - Entry point, routing, and rate limiting
- **Auth Service** (Port 8081) - Authentication and authorization
- **User Service** (Port 8082) - User profile management
- **Project Service** (Port 8083) - Project and board management
- **GitHub Sync Service** (Port 8084) - GitHub integration
- **Collaboration Service** (Port 8085) - Team collaboration
- **Feedback Service** (Port 8086) - Reviews and ratings
- **Notification Service** (Port 8087) - Real-time notifications

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Docker and Docker Compose

## Quick Start

### 1. Start Infrastructure Services

```bash
# Start databases and message queues
docker-compose up -d postgres mongodb redis rabbitmq
```

### 2. Build All Services

```bash
# Build all microservices
mvn clean package -DskipTests
```

### 3. Run Services Locally

```bash
# Start each service in separate terminals
cd auth-service && mvn spring-boot:run
cd user-service && mvn spring-boot:run
cd project-service && mvn spring-boot:run
cd github-sync-service && mvn spring-boot:run
cd collaboration-service && mvn spring-boot:run
cd feedback-service && mvn spring-boot:run
cd notification-service && mvn spring-boot:run
cd api-gateway && mvn spring-boot:run
```

### 4. Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build
```

## Service URLs

- API Gateway: http://localhost:8080
- Auth Service: http://localhost:8081
- User Service: http://localhost:8082
- Project Service: http://localhost:8083
- GitHub Sync Service: http://localhost:8084
- Collaboration Service: http://localhost:8085
- Feedback Service: http://localhost:8086
- Notification Service: http://localhost:8087

## Database Access

- PostgreSQL: localhost:5432 (user: skillsync, password: skillsync123)
- MongoDB: localhost:27017 (user: skillsync, password: skillsync123)
- Redis: localhost:6379
- RabbitMQ Management: http://localhost:15672 (user: skillsync, password: skillsync123)

## Health Checks

Each service provides health check endpoints:
- http://localhost:808X/actuator/health

## Configuration

### Environment Variables

- `JWT_SECRET`: JWT signing secret (default: provided in application.yml)
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret
- `MAIL_HOST`: SMTP server host
- `MAIL_USERNAME`: Email username
- `MAIL_PASSWORD`: Email password

### Profiles

- `default`: Local development with localhost connections
- `docker`: Docker environment with container networking

## Development

### Adding New Services

1. Create new module in root pom.xml
2. Create service directory with pom.xml
3. Add Spring Boot application class
4. Configure application.yml
5. Add Dockerfile
6. Update docker-compose.yml

### Shared Libraries

Common utilities, DTOs, and security components are in the `shared-libraries` module. Include it as a dependency in service pom.xml files.

## Testing

```bash
# Run tests for all services
mvn test

# Run tests for specific service
cd auth-service && mvn test
```

## Monitoring

- Health checks: `/actuator/health`
- Metrics: `/actuator/metrics`
- Info: `/actuator/info`