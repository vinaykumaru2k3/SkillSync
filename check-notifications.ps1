# Notification System Diagnostic Script

Write-Host "=== SkillSync Notification System Diagnostics ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check if RabbitMQ is running
Write-Host "1. Checking RabbitMQ..." -ForegroundColor Yellow
try {
    $rabbitmq = Invoke-RestMethod -Uri "http://localhost:15672/api/overview" -Headers @{Authorization=("Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("skillsync:skillsync123")))}
    Write-Host "   ✓ RabbitMQ is running" -ForegroundColor Green
    Write-Host "   Version: $($rabbitmq.rabbitmq_version)" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ RabbitMQ is NOT running or not accessible" -ForegroundColor Red
    Write-Host "   Start it with: docker-compose up -d rabbitmq" -ForegroundColor Yellow
}

# 2. Check notification queue
Write-Host ""
Write-Host "2. Checking notification queue..." -ForegroundColor Yellow
try {
    $queue = Invoke-RestMethod -Uri "http://localhost:15672/api/queues/%2F/notification.queue" -Headers @{Authorization=("Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("skillsync:skillsync123")))}
    Write-Host "   ✓ Queue exists: notification.queue" -ForegroundColor Green
    Write-Host "   Messages ready: $($queue.messages_ready)" -ForegroundColor Gray
    Write-Host "   Messages unacked: $($queue.messages_unacknowledged)" -ForegroundColor Gray
    Write-Host "   Total messages: $($queue.messages)" -ForegroundColor Gray
    
    if ($queue.messages -gt 0) {
        Write-Host "   ⚠ Messages are stuck in queue - notification-service may not be consuming" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ✗ Queue does not exist or not accessible" -ForegroundColor Red
}

# 3. Check Redis
Write-Host ""
Write-Host "3. Checking Redis..." -ForegroundColor Yellow
try {
    docker exec skillsync-redis-1 redis-cli PING | Out-Null
    Write-Host "   ✓ Redis is running" -ForegroundColor Green
    
    $notifCount = docker exec skillsync-redis-1 redis-cli KEYS "notification:*" | Measure-Object | Select-Object -ExpandProperty Count
    Write-Host "   Notifications in Redis: $notifCount" -ForegroundColor Gray
} catch {
    Write-Host "   ✗ Redis is NOT running" -ForegroundColor Red
}

# 4. Check services
Write-Host ""
Write-Host "4. Checking services..." -ForegroundColor Yellow

$services = @(
    @{Name="collaboration-service"; Port=8085},
    @{Name="notification-service"; Port=8087},
    @{Name="user-service"; Port=8082},
    @{Name="project-service"; Port=8083}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)/actuator/health" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "   ✓ $($service.Name) is running on port $($service.Port)" -ForegroundColor Green
    } catch {
        Write-Host "   ✗ $($service.Name) is NOT running on port $($service.Port)" -ForegroundColor Red
    }
}

# 5. Test notification API
Write-Host ""
Write-Host "5. Testing notification API..." -ForegroundColor Yellow
Write-Host "   Enter a user ID to check notifications (or press Enter to skip): " -NoNewline
$userId = Read-Host

if ($userId) {
    try {
        $notifications = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/notifications" -Headers @{"X-User-Id"=$userId}
        Write-Host "   ✓ Found $($notifications.Count) notifications for user $userId" -ForegroundColor Green
        
        if ($notifications.Count -gt 0) {
            Write-Host ""
            Write-Host "   Recent notifications:" -ForegroundColor Cyan
            $notifications | Select-Object -First 3 | ForEach-Object {
                Write-Host "   - [$($_.type)] $($_.title): $($_.message)" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "   ✗ Failed to fetch notifications: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 6. Check logs
Write-Host ""
Write-Host "6. Checking recent logs..." -ForegroundColor Yellow
Write-Host "   Run these commands to check logs:" -ForegroundColor Cyan
Write-Host "   docker-compose logs --tail=50 collaboration-service" -ForegroundColor Gray
Write-Host "   docker-compose logs --tail=50 notification-service" -ForegroundColor Gray

Write-Host ""
Write-Host "=== Diagnostic Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If RabbitMQ is not running: docker-compose up -d rabbitmq" -ForegroundColor White
Write-Host "2. If services are not running: docker-compose up -d servicename" -ForegroundColor White
Write-Host "3. Check collaboration-service logs when sending invitation" -ForegroundColor White
Write-Host "4. Check notification-service logs for processing messages" -ForegroundColor White
