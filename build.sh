#!/bin/bash

echo "Building SkillSync Platform..."

# Build shared libraries first
echo "Building shared libraries..."
cd shared-libraries
mvn clean install -DskipTests
cd ..

# Build all services
echo "Building all microservices..."
mvn clean package -DskipTests

echo "Build completed successfully!"
echo ""
echo "To start the platform:"
echo "1. Start infrastructure: docker-compose up -d postgres mongodb redis rabbitmq"
echo "2. Start services: docker-compose up --build"
echo "   OR run each service individually with: mvn spring-boot:run"