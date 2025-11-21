# SkillSync Service Restart Script
# This script helps restart the backend services

Write-Host "=== SkillSync Service Restart ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker containers are running
Write-Host "Checking Docker containers..." -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String -Pattern "skillsync"

Write-Host ""
Write-Host "To fix the 500 error, please:" -ForegroundColor Green
Write-Host "1. Stop the following services in your terminals (Ctrl+C):" -ForegroundColor White
Write-Host "   - user-service" -ForegroundColor Cyan
Write-Host "   - collaboration-service" -ForegroundColor Cyan
Write-Host "   - auth-service (optional, but recommended)" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Restart them using Spring Boot Dashboard or:" -ForegroundColor White
Write-Host "   cd user-service && mvn spring-boot:run" -ForegroundColor Gray
Write-Host "   cd collaboration-service && mvn spring-boot:run" -ForegroundColor Gray
Write-Host "   cd auth-service && mvn spring-boot:run" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Refresh your browser at http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "The services will reconnect to PostgreSQL and the 500 error will be resolved." -ForegroundColor Green
