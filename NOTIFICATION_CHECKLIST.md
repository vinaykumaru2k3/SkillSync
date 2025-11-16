# Notification System Checklist

Run these commands in order to diagnose the issue:

## 1. Check RabbitMQ is Running
```bash
docker ps | findstr rabbitmq
```
**Expected:** Should show rabbitmq container running

**If not running:**
```bash
docker-compose up -d rabbitmq
```

## 2. Check RabbitMQ Management UI
Open: http://localhost:15672
- Username: `skillsync`
- Password: `skillsync123`

Check:
- Go to "Queues" tab
- Look for `notification.queue`
- Check if messages are stuck (Ready > 0 means messages not being consumed)

## 3. Check All Services Are Running
```bash
docker-compose ps
```

**Required services:**
- collaboration-service (port 8085)
- notification-service (port 8087)
- user-service (port 8082)
- project-service (port 8083)
- rabbitmq (port 5672, 15672)
- redis (port 6379)

## 4. Check Collaboration Service Logs
```bash
docker-compose logs collaboration-service | findstr "notification"
```

**When you send invitation, you should see:**
```
Published notification event: INVITATION for user {inviteeId}
```

**If you see:**
```
RabbitTemplate not available, skipping notification
```
**Problem:** RabbitMQ config missing or service needs restart

## 5. Check Notification Service Logs
```bash
docker-compose logs notification-service | findstr "Processing"
```

**You should see:**
```
Processing notification event for user {inviteeId}: INVITATION
```

**If you DON'T see this:**
- RabbitMQ listener is not working
- Check if notification-service connected to RabbitMQ on startup

## 6. Check Redis for Stored Notifications
```bash
docker exec -it skillsync-redis-1 redis-cli
```

Then in Redis CLI:
```
KEYS notification:*
```

**Should show:** List of notification keys

To see a specific notification:
```
GET notification:{notificationId}
```

## 7. Test Notification API Directly
Replace `{userId}` with actual invitee user ID:

```bash
curl -H "X-User-Id: {userId}" http://localhost:8080/api/v1/notifications
```

**Should return:** JSON array of notifications

## 8. Check Frontend WebSocket Connection
Open browser console (F12) on invitee's account:

**Should see:**
```
WebSocket connected
Subscribed to /user/queue/notifications
```

**If not connected:**
- Check notification-service is running on port 8087
- Check WebSocket endpoint: ws://localhost:8087/ws

## 9. Manual Test - Send Test Notification

Create a test file `test-notification.json`:
```json
{
  "userId": "PUT_INVITEE_USER_ID_HERE",
  "type": "INVITATION",
  "title": "Test Notification",
  "message": "This is a test",
  "actionUrl": "/collaborations",
  "relatedEntityId": "test-id",
  "relatedEntityType": "PROJECT"
}
```

Send to RabbitMQ via management UI:
1. Go to http://localhost:15672
2. Click "Queues" → "notification.queue"
3. Click "Publish message"
4. Paste JSON in payload
5. Click "Publish message"

Check if notification appears for the user.

## 10. Rebuild Services (If All Else Fails)

```bash
# Stop all services
docker-compose down

# Rebuild with new dependencies
cd collaboration-service
mvn clean package -DskipTests

cd ../project-service
mvn clean package -DskipTests

cd ../feedback-service
mvn clean package -DskipTests

cd ../notification-service
mvn clean package -DskipTests

# Start everything
cd ..
docker-compose up --build -d
```

## Common Issues and Solutions

### Issue: "RabbitTemplate not available"
**Cause:** Missing RabbitMQ dependency or configuration
**Solution:** 
1. Check `pom.xml` has `spring-boot-starter-amqp`
2. Check `application.yml` has rabbitmq config
3. Rebuild and restart service

### Issue: Messages stuck in queue
**Cause:** Notification-service not consuming
**Solution:**
1. Check notification-service logs for errors
2. Verify `@RabbitListener` annotation is present
3. Check method signature accepts `Map<String, Object>`

### Issue: Notification saved but not delivered
**Cause:** WebSocket not connected or user not subscribed
**Solution:**
1. Check browser console for WebSocket connection
2. Verify subscription to `/user/queue/notifications`
3. Check notification-service WebSocket config

### Issue: Frontend not fetching notifications
**Cause:** API call failing or hook not initialized
**Solution:**
1. Check browser console for API errors
2. Verify `useNotifications` hook is being used
3. Check user is authenticated (has userId)

## Quick Diagnostic Command

Run all checks at once:
```bash
echo "=== RabbitMQ ===" && docker ps | findstr rabbitmq && echo "" && echo "=== Services ===" && docker-compose ps && echo "" && echo "=== Collaboration Logs ===" && docker-compose logs --tail=20 collaboration-service && echo "" && echo "=== Notification Logs ===" && docker-compose logs --tail=20 notification-service
```
