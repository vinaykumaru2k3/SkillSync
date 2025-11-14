# Account Linking Implementation Checklist

## ✅ Completed

### Backend Implementation
- [x] Created `AccountLinkingService.java` - Core linking logic
- [x] Updated `OAuthService.java` - Integrated account linking
- [x] Created `AccountLinkingController.java` - API endpoints
- [x] Created database migration `V3__add_oauth_provider_ids.sql`

### Frontend Implementation
- [x] Created `accountLinkingService.ts` - API client
- [x] Created `LinkedAccounts.tsx` - UI component
- [x] Fixed duplicate `/api/v1` bug in `userService.ts`

### Documentation
- [x] Created `ACCOUNT_LINKING_GUIDE.md` - Complete algorithm & flows
- [x] Created `ACCOUNT_LINKING_TESTING.md` - Testing guide
- [x] Created `account-linking-queries.sql` - SQL utilities

## 🔄 Next Steps

### 1. Database Migration
```bash
# Run the migration
cd auth-service
./mvnw flyway:migrate

# Or if using Spring Boot auto-migration, just restart the service
./mvnw spring-boot:run
```

### 2. Restart Services
```bash
# Restart auth-service to load new code
cd auth-service
./mvnw spring-boot:run

# Restart frontend
cd Frontend
npm run dev
```

### 3. Test Basic Flow
```bash
# Test 1: Manual account + GitHub OAuth
1. Register at http://localhost:3000/register
   Email: test@example.com
   Password: Test123!@#

2. Logout

3. Click "Sign in with GitHub"
   Use GitHub account with same email

4. Should login successfully (not create new account)

5. Go to Settings → verify both methods are linked
```

### 4. Verify Database
```sql
-- Check the linking worked
SELECT 
    u.email,
    u.password_hash IS NOT NULL as has_password,
    STRING_AGG(uop.provider, ', ') as providers
FROM users u
LEFT JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.email = 'test@example.com'
GROUP BY u.id, u.email, u.password_hash;

-- Expected: has_password = true, providers = 'github'
```

## 📋 Optional Enhancements

### Priority 1: Email Notifications
```java
// Notify user when new provider is linked
@Service
public class AccountLinkingNotificationService {
    public void notifyProviderLinked(User user, String provider) {
        emailService.send(
            user.getEmail(),
            "New login method added",
            "GitHub was linked to your account. If this wasn't you, please contact support."
        );
    }
}
```

### Priority 2: Audit Logging
```sql
-- Track all account linking events
CREATE TABLE auth_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50), -- 'oauth_linked', 'oauth_unlinked', 'password_set'
    provider VARCHAR(50),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Priority 3: Account Merging UI
```typescript
// Allow users to manually merge duplicate accounts
const AccountMerge = () => {
  // UI to select which account to keep
  // Transfer data from old account to new
  // Delete old account
};
```

### Priority 4: OAuth Provider ID Tracking
```java
// Enhanced entity to track provider-specific IDs
@Entity
public class OAuthIdentity {
    @Id
    private UUID id;
    
    @ManyToOne
    private User user;
    
    private String provider;
    private String providerUserId;
    private String providerEmail;
    
    // Allows handling email changes on OAuth provider
}
```

### Priority 5: Settings Page Integration
```typescript
// Add LinkedAccounts component to settings page
// Frontend/src/app/settings/page.tsx

import { LinkedAccounts } from '@/components/features/settings/LinkedAccounts'

export default function SettingsPage() {
  return (
    <div>
      <h1>Account Settings</h1>
      <LinkedAccounts />
    </div>
  )
}
```

## 🧪 Testing Checklist

- [ ] Test Scenario 1: Manual → Add OAuth
- [ ] Test Scenario 2: OAuth → Add Password
- [ ] Test Scenario 3: Cannot unlink last method
- [ ] Test Scenario 4: Unlink with alternative
- [ ] Test Scenario 5: Different emails = different accounts
- [ ] Test Scenario 6: GitHub email not public
- [ ] Test Scenario 7: Inactive account
- [ ] Test Scenario 8: Concurrent login methods

## 🚨 Known Limitations

1. **GitHub Email Not Public**: Creates separate account with fallback email
   - **Mitigation**: Provide account merge tool
   - **User Action**: Make email public on GitHub

2. **Email Changes on OAuth Provider**: May create duplicate account
   - **Solution**: Implement OAuth provider ID tracking (Priority 4)

3. **No Email Verification**: Manual signups don't verify email
   - **Enhancement**: Add email verification flow

4. **No 2FA**: Single factor authentication only
   - **Enhancement**: Add TOTP-based 2FA

## 📊 Monitoring

### Key Metrics
```sql
-- Daily account linking report
SELECT 
    DATE(created_at) as date,
    COUNT(*) as new_users,
    SUM(CASE WHEN password_hash IS NOT NULL THEN 1 ELSE 0 END) as with_password,
    (SELECT COUNT(DISTINCT user_id) FROM user_oauth_providers 
     WHERE DATE(created_at) = DATE(u.created_at)) as with_oauth
FROM users u
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Alerts to Set Up
- Duplicate accounts detected (same email)
- Failed linking attempts spike
- OAuth-only accounts > 50% (may indicate issue)
- Accounts with no auth method (critical error)

## 🔒 Security Review

- [x] Email is unique constraint in database
- [x] Cannot unlink last auth method
- [x] Inactive accounts cannot login
- [ ] Add rate limiting on OAuth endpoints
- [ ] Add email notifications for account changes
- [ ] Add login history tracking
- [ ] Add 2FA support

## 📝 Documentation Updates Needed

- [ ] Update API documentation with new endpoints
- [ ] Update user guide with account linking instructions
- [ ] Add troubleshooting section for common issues
- [ ] Create admin guide for handling duplicate accounts

## ✨ Success Criteria

The implementation is successful when:
1. ✅ Users can link multiple auth methods to one account
2. ✅ No duplicate accounts created for same email
3. ✅ Users can login with any linked method
4. ✅ Safety checks prevent account lockout
5. ✅ Clear UI shows linked accounts
6. ✅ All tests pass
7. ✅ Performance is acceptable (<500ms)
8. ✅ No data loss during linking

## 🎯 Rollout Plan

### Phase 1: Internal Testing (Week 1)
- Deploy to staging environment
- Test all scenarios
- Fix any issues

### Phase 2: Beta Testing (Week 2)
- Enable for 10% of users
- Monitor metrics
- Gather feedback

### Phase 3: Full Rollout (Week 3)
- Enable for all users
- Monitor for issues
- Provide support

### Phase 4: Enhancements (Week 4+)
- Add email notifications
- Add audit logging
- Add account merge tool
- Add OAuth provider ID tracking
