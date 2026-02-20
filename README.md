# SkillSync Platform






## Overview

**SkillSync** is a developer-centric platform combining portfolio building, project collaboration, and skill synchronization through a modern **Spring Boot microservices architecture** with a **Next.js/React frontend**. Built as independently deployable services with Docker support, it provides portfolio management, GitHub integration, real-time collaboration, and feedback systems for developers.

## Architecture

<img width="5714" height="1898" alt="Next js Frontend API-2026-02-20-070450" src="https://github.com/user-attachments/assets/01910158-4a37-4c7d-8994-a628bac03b9e" />

## Core Microservices:
- **API Gateway** (8080) - Routing, rate limiting, circuit breakers
- **Auth Service** (8081) - JWT authentication & authorization
- **User Service** (8082) - Developer profiles & portfolios
- **Project Service** (8083) - Project boards & management
- **GitHub Sync Service** (8084) - Repository synchronization
- **Collaboration Service** (8085) - Real-time team features
- **Feedback Service** (8086) - Reviews, ratings & testimonials
- **Notification Service** (8087) - Real-time updates

## Key Features

- 👤 Developer portfolio with GitHub repo sync
- 🤝 Real-time collaboration & project boards
- ⭐ Feedback/rating system
- 🔔 WebSocket notifications
- 🔐 JWT-based authentication
- 📊 Actuator monitoring & health checks
- 🚀 Dockerized services with docker-compose

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | Spring Boot 3.x, Java 17+, Maven |
| **Frontend** | Next.js 14, React 18, TypeScript |
| **API** | REST, Spring Cloud Gateway |
| **Database** | PostgreSQL, MongoDB |
| **Cache** | Redis |
| **Queue** | RabbitMQ |
| **Real-time** | WebSockets |
| **DevOps** | Docker, Docker Compose |

## Key Dependencies

**Backend (pom.xml):**
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-mongodb</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>
    <dependency>
        <groupId>io.github.resilience4j</groupId>
        <artifactId>resilience4j-spring-boot3</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-amqp</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.5.0</version>
    </dependency>
</dependencies>
```

**Frontend (package.json):**
```json
{
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.45.0",
    "zod": "^3.22.0",
    "axios": "^1.6.0",
    "tailwindcss": "^3.3.0"
  }
}
```

## 🚀 Quick Start

### Prerequisites

```bash
Java 17+  Maven 3.6+  Node.js 18+  Docker  Docker Compose
```

### 1. Start Infrastructure

```bash
docker-compose up -d postgres mongodb redis rabbitmq
```

### 2. Backend Setup

```bash
# Build all services
mvn clean package -DskipTests

# OR run with Docker
docker-compose up --build
```

### 3. Frontend Setup

```bash
cd Frontend
npm install
npm run dev  # http://localhost:3000
```

### 4. Access Services

```
API Gateway: http://localhost:8080
Frontend:   http://localhost:3000
RabbitMQ:   http://localhost:15672 (skillsync/skillsync123)
Postgres:   localhost:5432 (skillsync/skillsync123)
```

## Project Structure

```
SkillSync/
├── Frontend/              # Next.js 14 + React 18 + TypeScript
│   ├── src/app/          # App Router (pages, layout)
│   ├── src/components/   # UI components (Button, Modal, etc.)
│   └── src/lib/api/      # API client & services
├── api-gateway/          # Spring Cloud Gateway
├── auth-service/         # JWT Authentication
├── user-service/         # User profiles & portfolios
├── project-service/      # Project management
├── github-sync-service/  # GitHub API integration
├── collaboration-service/ # Real-time collaboration
├── feedback-service/     # Reviews & ratings
├── notification-service/ # WebSocket notifications
├── shared-libraries/     # Common DTOs, JWT utils
├── docker-compose.yml    # Infrastructure stack
└── pom.xml              # Multi-module Maven
```

## Configuration

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_DB: skillsync
      POSTGRES_USER: skillsync
      POSTGRES_PASSWORD: skillsync123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongodb:
    image: mongo:7
    restart: always
    environment:
      MONGO_INITDB_DATABASE: skillsync
      MONGO_INITDB_ROOT_USERNAME: skillsync
      MONGO_INITDB_ROOT_PASSWORD: skillsync123
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  rabbitmq:
    image: rabbitmq:3-management
    restart: always
    environment:
      RABBITMQ_DEFAULT_USER: skillsync
      RABBITMQ_DEFAULT_PASS: skillsync123
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

volumes:
  postgres_data:
  mongo_data:
  redis_data:
  rabbitmq_data:
```

**.env (Frontend):**

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**application.yml (Services):**

```yaml
spring:
  profiles: docker
  datasource:
    url: jdbc:postgresql://postgres:5432/skillsync
    username: skillsync
    password: skillsync123
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

jwt:
  secret: ${JWT_SECRET:sk1llsync-s3cr3t}

github:
  client-id: ${GITHUB_CLIENT_ID}
  client-secret: ${GITHUB_CLIENT_SECRET}
```

**Environment Variables:**

```bash
JWT_SECRET=your-super-secret-key
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
MAIL_HOST=smtp.gmail.com
```

## API Endpoints

| Endpoint | Method | Service | Description |
|----------|--------|---------|-------------|
| `/api/auth/login` | POST | Auth | JWT token generation |
| `/api/users/profile` | GET | User | Get developer profile |
| `/api/projects` | POST | Project | Create project board |
| `/api/github/repos` | GET | GitHub | Sync repositories |
| `/api/collaboration/room` | WS | Collab | Join collaboration room |
| `/api/feedback` | POST | Feedback | Submit review |
| `/api/notifications` | WS | Notif | Real-time updates |

**Swagger Docs:** `http://localhost:8080/swagger-ui.html`

## Testing

```bash
# Backend tests
mvn test

# Frontend tests
cd Frontend && npm test

# Integration tests (Testcontainers)
mvn test -Pintegration
```

## Monitoring

```
Health:      http://localhost:808X/actuator/health
Metrics:     http://localhost:808X/actuator/metrics
Info:        http://localhost:808X/actuator/info
Gateway Routes: http://localhost:8080/actuator/gateway/routes
```

## Deployment

```bash
# Production build
mvn clean package -Pprod
docker-compose -f docker-compose.prod.yml up --build

# Push to registry
docker push your-registry/skillsync-api-gateway:latest
```

## Future Enhancements

- [ ] Kubernetes deployment with Helm charts
- [ ] OpenTelemetry distributed tracing
- [ ] Service mesh (Istio/Linkerd)
- [ ] CI/CD with GitHub Actions
- [ ] Mobile app (React Native)

## Contributing

1. Fork & clone: `git clone https://github.com/vinaykumaru2k3/SkillSync`
2. Create branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push & PR: `git push origin feature/your-feature`

**Commit Style:** Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)

## License

MIT License - see [LICENSE](LICENSE) for details.
