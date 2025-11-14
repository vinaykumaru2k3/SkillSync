# Account Linking Quick Reference

## 🎯 Core Concept

**One Email = One Account** (regardless of login method)

## 🔄 How It Works

```
User signs up with email/password
    ↓
Later logs in with GitHub (same email)
    ↓
System automatically links GitHub to existing account
    ↓
User can now login with EITHER method
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `AccountLinkingService.java` | Core linking logic |
| `OAuthService.java` | OAuth integration |
| `AccountLinkingController.java` | API endpoints |
| `LinkedAccounts.tsx` | UI component |
| `accountLinkingService.ts` | Frontend API client |

## 🔌 API Endpoints

### Get Linked Providers
```http
GET /api/v1/auth/account/linked-providers
Authorization: Bearer <token>
```

**Response:**
```json
{
  "email": "user@example.com",
  "hasPassword": true,
  "hasOAuth": true,
  "linkedProviders": ["github"],
  "canUnlinkProvider": true
}
```

### Unlink Provider
```http
DELETE /api/v1/auth/account/unlink/{provider}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Provider unlinked successfully",
  "provider": "github"
}
```

## 💾 Database Schema

```sql
-- Main users table
users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),  -- NULL for OAuth-only
    is_active BOOLEAN
)

-- OAuth providers (many-to-many)
user_oauth_providers (
    user_id UUID,
    provider VARCHAR(50)  -- 'github', 'google', etc.
)
```

## 🔍 Useful SQL Queries

### Check User's Auth Methods
```sql
SELECT 
    u.email,
    u.password_hash IS NOT NULL as has_password,
    STRING_AGG(uop.provider, ', ') as providers
FROM users u
LEFT JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.email = 'user@example.com'
GROUP BY u.id, u.email, u.password_hash;
```

### Find Users with Multiple Methods
```sql
SELECT u.email, COUNT(uop.provider) as provider_count
FROM users u
INNER JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.password_hash IS NOT NULL
GROUP BY u.email
HAVING COUNT(uop.provider) > 0;
```

### Manually Link Provider
```sql
INSERT INTO user_oauth_providers (user_id, provider)
VALUES ('user-uuid-here', 'github');
```

## 🧪 Quick Test

```bash
# 1. Register manually
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'

# 2. Login with GitHub (same email)
# Visit: http://localhost:3000
# Click "Sign in with GitHub"

# 3. Verify linking
curl http://localhost:8080/api/v1/auth/account/linked-providers \
  -H "Authorization: Bearer <token>"

# Expected: Both password and github linked
```

## ⚠️ Safety Rules

1. **Cannot unlink last auth method**
   - User must have password OR another OAuth provider
   - Prevents account lockout

2. **Email is unique**
   - One email = one account
   - Database constraint enforces this

3. **Inactive accounts cannot login**
   - Even with valid OAuth

## 🐛 Common Issues

### Issue: Two accounts for same person
**Cause**: Different emails used (e.g., GitHub email not public)
**Fix**: Use account merge script

### Issue: Cannot login after linking
**Cause**: Account inactive or tokens expired
**Fix**: Check `is_active` status, regenerate tokens

### Issue: "Email not provided by OAuth provider"
**Cause**: GitHub email is private
**Fix**: User must make email public in GitHub settings

## 🎨 Frontend Usage

```typescript
import { accountLinkingService } from '@/lib/api/services/accountLinkingService'

// Get linked providers
const providers = await accountLinkingService.getLinkedProviders()

// Unlink provider
await accountLinkingService.unlinkProvider('github')

// Connect GitHub
window.location.href = `${API_URL}/oauth2/authorization/github`
```

## 🔐 Security Checklist

- ✅ Email uniqueness enforced
- ✅ Cannot unlink last method
- ✅ Inactive accounts blocked
- ⚠️ Add rate limiting
- ⚠️ Add email notifications
- ⚠️ Add 2FA support

## 📊 Monitoring Queries

```sql
-- Account linking stats
SELECT 
    'Total Users' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 'With Password', COUNT(*) FROM users WHERE password_hash IS NOT NULL
UNION ALL
SELECT 'With OAuth', COUNT(DISTINCT user_id) FROM user_oauth_providers
UNION ALL
SELECT 'With Both', COUNT(*)
FROM users u
INNER JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.password_hash IS NOT NULL;
```

## 🚀 Deployment Steps

1. **Run migration**
   ```bash
   ./mvnw flyway:migrate
   ```

2. **Restart services**
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Test basic flow**
   - Register manually
   - Login with GitHub
   - Verify linking

4. **Monitor logs**
   ```bash
   tail -f logs/auth-service.log | grep "OAuth login"
   ```

## 📞 Support

### For Users
- "How do I link my GitHub?" → Settings → Connected Accounts → Connect
- "I have two accounts" → Contact support for account merge
- "Cannot disconnect GitHub" → Set a password first

### For Admins
- Merge accounts: Use `account-linking-queries.sql` script #12
- Check linking status: Use monitoring queries
- Disable linking: Set `skillsync.auth.auto-link-accounts=false`

## 🎓 Learning Resources

- Full guide: `ACCOUNT_LINKING_GUIDE.md`
- Testing: `ACCOUNT_LINKING_TESTING.md`
- SQL utilities: `account-linking-queries.sql`
- Implementation: `IMPLEMENTATION_CHECKLIST.md`
