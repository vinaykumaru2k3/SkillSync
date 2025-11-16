# Notification Troubleshooting Guide

## Issue: Invitee Not Receiving Invitation Notification

### Step 1: Check Collaboration Service Logs

When you send an invitation, check collaboration-service logs for:

```
Publishing event: INVITATION_CREATED for collaboration {id}
Published notification event: INVITATION for user {inviteeId}
```

**If you see "RabbitTemplate not available":**
- RabbitMQ dependency is missing or service needs restart
- Run: `cd collaboration-service && mvn clean package -DskipTests`
- Restart collaboration-service

**If you see an exception:**
- Check the error message for details
- Verify user-service and project-service are running (EventPublisher calls them)

### Step 2: Check Notification Service Logs

After invitation is sent, check notification-service logs for:

```
Processing notification event for user {inviteeId}: INVITATION
```

**If you DON'T see this log:**
- RabbitMQ queue is not being consumed
- Check RabbitMQ is running: `docker ps | grep rabbitmq`
- Check RabbitMQ management UI: http://localhost:15672
  - Login: skillsync / skillsync123
  - Check if `notification.queue` exists
  - Check if messages are in the queue (should be 0 if consumed)

**If you see "Failed to process notification":**
- Check the error details
- Common issue: Type conversion error (should be fixed now)

### Step 3: Check WebSocket Connection

Open browser console on invitee's account and check for:

```
WebSocket connected
Subscribed to /user/queue/notifications
```

**If WebSocket is not connected:**
- Check notification-service is running on port 8087
- Check WebSocket endpoint: ws://localhost:8087/ws
- Check browser console for connection errors

**To manually test WebSocket:**
```javascript
// In browser console
console.log('WebSocket status:', window.stompClient?.connected);
```

### Step 4: Check Notification Storage

Check if notification was saved to Redis:

**Option A: Using Redis CLI**
```bash
docker exec -it skillsync-redis-1 redis-cli
KEYS notification:*
GET notification:{notificationId}
```

**Option B: Using API**
```bash
# Get invitee's notifications
curl -H "X-User-Id: {inviteeId}" http://localhost:8080/api/v1/notifications
```

### Step 5: Check User Preferences

Verify invitee's notification preferences allow INVITATION notifications:

```bash
curl -H "X-User-Id: {inviteeId}" http://localhost:8080/api/v1/notifications/preferences
```

Should return preferences with INVITATION delivery channel (WEBSOCKET, EMAIL, or BOTH).

### Step 6: Manual Test

**Test RabbitMQ directly:**

1. Check RabbitMQ Management UI: http://localhost:15672
2. Go to Queues → notification.queue
3. Click "Get messages"
4. If messages are stuck, they're not being consumed

**Test notification creation directly:**

```bash
# Send test notification via API (if you add a test endpoint)
curl -X POST http://localhost:8087/api/v1/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "{inviteeId}",
    "type": "INVITATION",
    "title": "Test",
    "message": "Test message"
  }'
```

## Common Issues and Solutions

### Issue: "RabbitTemplate not available"
**Solution:** Add RabbitMQ dependency and rebuild
```bash
cd collaboration-service
mvn clean package -DskipTests
# Restart service
```

### Issue: Notification saved but not delivered via WebSocket
**Solution:** 
- Check WebSocket connection in browser console
- Verify user is subscribed to `/user/queue/notifications`
- Check notification-service logs for WebSocket send attempts

### Issue: Type conversion error in notification-service
**Solution:** Already fixed - notification-service now accepts Map<String, Object>

### Issue: Services can't connect to RabbitMQ
**Solution:**
```bash
# Check RabbitMQ is running
docker ps | grep rabbitmq

# If not running, start it
docker-compose up -d rabbitmq

# Check connection in service logs
# Should see: "Established connection to RabbitMQ"
```

## Quick Diagnostic Commands

```bash
# 1. Check all services are running
docker-compose ps

# 2. Check RabbitMQ
curl -u skillsync:skillsync123 http://localhost:15672/api/overview

# 3. Check notification queue
curl -u skillsync:skillsync123 http://localhost:15672/api/queues/%2F/notification.queue

# 4. Check Redis
docker exec -it skillsync-redis-1 redis-cli PING

# 5. Tail collaboration-service logs
docker-compose logs -f collaboration-service

# 6. Tail notification-service logs
docker-compose logs -f notification-service
```

## Expected Flow

1. **User A sends invitation to User B**
2. **Collaboration-service** creates invitation in database
3. **Collaboration-service** publishes to RabbitMQ:
   ```json
   {
     "userId": "userB-id",
     "type": "INVITATION",
     "title": "New Collaboration Invitation",
     "message": "User A invited you to collaborate on Project X"
   }
   ```
4. **Notification-service** consumes from RabbitMQ
5. **Notification-service** saves to Redis
6. **Notification-service** checks if User B is online (WebSocket connected)
7. **If online:** Sends via WebSocket to User B
8. **If offline or EMAIL preference:** Sends email
9. **User B's browser** receives WebSocket message
10. **Frontend** displays notification in bell icon

## Still Not Working?

Check these files for correct configuration:

1. `collaboration-service/pom.xml` - Has spring-boot-starter-amqp
2. `notification-service/src/main/java/com/skillsync/notification/config/RabbitMQConfig.java` - Queue configured
3. `notification-service/src/main/java/com/skillsync/notification/service/NotificationService.java` - Listener accepts Map
4. `Frontend/src/contexts/WebSocketContext.tsx` - WebSocket connects to ws://localhost:8087/ws
5. `Frontend/src/hooks/useNotifications.ts` - Subscribes to /user/queue/notifications
