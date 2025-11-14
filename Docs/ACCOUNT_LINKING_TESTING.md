# Account Linking Testing Guide

## Quick Start Testing

### Prerequisites
1. Backend services running (auth-service, user-service)
2. PostgreSQL database running
3. Frontend running
4. GitHub OAuth configured

### Test Environment Setup

```bash
# 1. Clear test data (optional)
psql -d skillsync -c "DELETE FROM user_oauth_providers; DELETE FROM users;"

# 2. Verify services are running
curl http://localhost:8080/api/v1/auth/health
curl http://localhost:3000
```

## Test Scenarios

### Scenario 1: Manual Account → Add GitHub OAuth ✅

**Goal**: Verify that GitHub OAuth links to existing email/password account

**Steps**:
```
1. Open browser (incognito mode recommended)
2. Go to http://localhost:3000/register
3. Register with:
   - Email: test@example.com
   - Password: Test123!@#
4. Logout
5. Click "Sign in with GitHub"
6. Authorize with GitHub account that has email: test@example.com
7. Should login successfully (not create new account)
```

**Verification**:
```sql
-- Check user has both password and GitHub
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

**Expected Result**: ✅ User can login with BOTH email/password AND GitHub

---

### Scenario 2: GitHub OAuth → Add Password ✅

**Goal**: Verify user can add password to OAuth-only account

**Steps**:
```
1. Open browser (incognito mode)
2. Go to http://localhost:3000
3. Click "Sign in with GitHub"
4. Authorize with GitHub (email: oauth@example.com)
5. Go to Settings → Connected Accounts
6. Click "Set Password"
7. Enter new password: NewPass123!@#
8. Logout
9. Login with email/password
```

**Verification**:
```sql
SELECT 
    u.email,
    u.password_hash IS NOT NULL as has_password,
    STRING_AGG(uop.provider, ', ') as providers
FROM users u
LEFT JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.email = 'oauth@example.com'
GROUP BY u.id, u.email, u.password_hash;

-- Expected: has_password = true, providers = 'github'
```

**Expected Result**: ✅ User can login with BOTH methods

---

### Scenario 3: Cannot Unlink Last Auth Method ❌

**Goal**: Verify safety check prevents unlinking last auth method

**Steps**:
```
1. Login with GitHub-only account
2. Go to Settings → Connected Accounts
3. Try to click "Disconnect" on GitHub
4. Should see warning or disabled button
```

**Verification**:
```typescript
// Frontend should show:
canUnlinkProvider: false

// And display warning:
"You need at least one way to sign in. Set a password before disconnecting your last OAuth provider."
```

**Expected Result**: ❌ Cannot unlink (button disabled or shows error)

---

### Scenario 4: Unlink Provider (With Alternative) ✅

**Goal**: Verify user can unlink provider when they have alternatives

**Steps**:
```
1. Login with account that has BOTH password and GitHub
2. Go to Settings → Connected Accounts
3. Click "Disconnect" on GitHub
4. Confirm dialog
5. GitHub should be removed
6. Logout
7. Try to login with GitHub → Should fail or create new account
8. Login with email/password → Should work
```

**Verification**:
```sql
SELECT 
    u.email,
    u.password_hash IS NOT NULL as has_password,
    COALESCE(STRING_AGG(uop.provider, ', '), 'none') as providers
FROM users u
LEFT JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.email = 'test@example.com'
GROUP BY u.id, u.email, u.password_hash;

-- Expected: has_password = true, providers = 'none'
```

**Expected Result**: ✅ GitHub unlinked, can still login with password

---

### Scenario 5: Different Emails = Different Accounts ✅

**Goal**: Verify different emails create separate accounts

**Steps**:
```
1. Register manually with: user1@example.com
2. Logout
3. Login with GitHub (email: user2@example.com)
4. Should create separate account
```

**Verification**:
```sql
SELECT email, id FROM users 
WHERE email IN ('user1@example.com', 'user2@example.com');

-- Expected: 2 different rows with different IDs
```

**Expected Result**: ✅ Two separate accounts created

---

### Scenario 6: GitHub Email Not Public (Fallback) ⚠️

**Goal**: Verify fallback when GitHub email is private

**Steps**:
```
1. Make GitHub email private in GitHub settings
2. Login with GitHub
3. Should use username@github.user as email
```

**Verification**:
```sql
SELECT email FROM users WHERE email LIKE '%@github.user';

-- Expected: Email like 'githubusername@github.user'
```

**Expected Result**: ⚠️ Account created with fallback email

**Note**: This creates a separate account. User should make email public to link properly.

---

### Scenario 7: Inactive Account Cannot Link ❌

**Goal**: Verify disabled accounts cannot be accessed via OAuth

**Steps**:
```
1. Create account: banned@example.com
2. Admin disables account:
   UPDATE users SET is_active = false WHERE email = 'banned@example.com';
3. Try to login with GitHub (same email)
4. Should show error
```

**Expected Result**: ❌ Error: "This account has been disabled"

---

### Scenario 8: Concurrent Login Methods ✅

**Goal**: Verify user can use multiple methods interchangeably

**Steps**:
```
1. Setup account with password + GitHub
2. Login with password → Success
3. Logout
4. Login with GitHub → Success
5. Logout
6. Login with password → Success
```

**Expected Result**: ✅ All login methods work seamlessly

---

## Edge Case Testing

### Edge Case 1: Rapid OAuth Attempts
```
Test: Click "Sign in with GitHub" multiple times rapidly
Expected: Should handle gracefully, no duplicate accounts
```

### Edge Case 2: OAuth Callback Timeout
```
Test: Start OAuth flow, wait 10 minutes, complete
Expected: Should handle expired state gracefully
```

### Edge Case 3: Email Case Sensitivity
```
Test: Register with Test@Example.com, login with GitHub (test@example.com)
Expected: Should link (emails are case-insensitive)
```

### Edge Case 4: Email with Spaces
```
Test: OAuth returns email with leading/trailing spaces
Expected: Should trim and link correctly
```

### Edge Case 5: Special Characters in Email
```
Test: Email like user+tag@example.com
Expected: Should handle correctly
```

## Automated Test Suite

### Backend Unit Tests

```java
@SpringBootTest
class AccountLinkingServiceTest {
    
    @Autowired
    private AccountLinkingService accountLinkingService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void testLinkOAuthToExistingAccount() {
        // Create user with password
        User user = new User("test@example.com", "hashedPassword");
        userRepository.save(user);
        
        // Link GitHub
        User linked = accountLinkingService.linkOrCreateAccount(
            "test@example.com", "github", "github123"
        );
        
        // Verify
        assertEquals(user.getId(), linked.getId());
        assertTrue(linked.getOauthProviders().contains("github"));
        assertNotNull(linked.getPasswordHash());
    }
    
    @Test
    void testCreateNewAccountFromOAuth() {
        // Link GitHub (no existing user)
        User created = accountLinkingService.linkOrCreateAccount(
            "new@example.com", "github", "github456"
        );
        
        // Verify
        assertNotNull(created.getId());
        assertTrue(created.getOauthProviders().contains("github"));
        assertNull(created.getPasswordHash());
    }
    
    @Test
    void testCannotUnlinkLastAuthMethod() {
        // Create OAuth-only user
        User user = accountLinkingService.linkOrCreateAccount(
            "oauth@example.com", "github", "github789"
        );
        
        // Try to unlink
        assertThrows(IllegalStateException.class, () -> {
            accountLinkingService.unlinkProvider("oauth@example.com", "github");
        });
    }
    
    @Test
    void testCanUnlinkWithAlternative() {
        // Create user with password
        User user = new User("test@example.com", "hashedPassword");
        userRepository.save(user);
        
        // Link GitHub
        accountLinkingService.linkOrCreateAccount(
            "test@example.com", "github", "github999"
        );
        
        // Unlink GitHub
        boolean success = accountLinkingService.unlinkProvider(
            "test@example.com", "github"
        );
        
        assertTrue(success);
        
        // Verify
        User updated = userRepository.findByEmail("test@example.com").get();
        assertFalse(updated.getOauthProviders().contains("github"));
        assertNotNull(updated.getPasswordHash());
    }
}
```

### Frontend Integration Tests

```typescript
// Using Playwright or Cypress
describe('Account Linking', () => {
  it('should link GitHub to existing account', async () => {
    // Register manually
    await page.goto('/register')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'Test123!@#')
    await page.click('button[type="submit"]')
    
    // Logout
    await page.click('[data-testid="logout"]')
    
    // Login with GitHub
    await page.click('[data-testid="github-login"]')
    // ... handle OAuth flow ...
    
    // Verify logged in
    await expect(page.locator('[data-testid="user-email"]'))
      .toHaveText('test@example.com')
    
    // Check linked accounts
    await page.goto('/settings/accounts')
    await expect(page.locator('[data-testid="github-status"]'))
      .toHaveText('✓ Connected')
    await expect(page.locator('[data-testid="password-status"]'))
      .toHaveText('✓ Connected')
  })
  
  it('should prevent unlinking last auth method', async () => {
    // Login with GitHub only
    await loginWithGitHub()
    
    // Go to settings
    await page.goto('/settings/accounts')
    
    // Disconnect button should be disabled
    const disconnectBtn = page.locator('[data-testid="unlink-github"]')
    await expect(disconnectBtn).toBeDisabled()
    
    // Warning should be visible
    await expect(page.locator('[data-testid="last-method-warning"]'))
      .toBeVisible()
  })
})
```

## Performance Testing

### Load Test: Concurrent OAuth Logins

```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8080/api/v1/auth/oauth/github/callback

# Expected: No duplicate accounts, all requests handled
```

### Database Query Performance

```sql
-- Test query performance with large dataset
EXPLAIN ANALYZE
SELECT 
    u.email,
    u.password_hash IS NOT NULL as has_password,
    STRING_AGG(uop.provider, ', ') as providers
FROM users u
LEFT JOIN user_oauth_providers uop ON u.id = uop.user_id
GROUP BY u.id, u.email, u.password_hash;

-- Should use indexes efficiently
```

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Account Linking Rate**
   ```sql
   SELECT COUNT(*) FROM users WHERE password_hash IS NOT NULL
   AND id IN (SELECT user_id FROM user_oauth_providers);
   ```

2. **Failed Linking Attempts**
   ```
   Monitor logs for: "Cannot link account"
   ```

3. **OAuth-Only Accounts**
   ```sql
   SELECT COUNT(*) FROM users WHERE password_hash IS NULL;
   ```

4. **Duplicate Account Detection**
   ```sql
   SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;
   ```

## Rollback Procedure

If issues are detected:

```sql
-- 1. Disable automatic linking (application.properties)
skillsync.auth.auto-link-accounts=false

-- 2. Identify affected users
SELECT * FROM users WHERE updated_at > '2024-01-01' 
AND id IN (SELECT user_id FROM user_oauth_providers);

-- 3. Manual review and fix
-- Use queries from account-linking-queries.sql

-- 4. Re-enable after fixes
skillsync.auth.auto-link-accounts=true
```

## Success Criteria

✅ All test scenarios pass
✅ No duplicate accounts created
✅ Users can login with all linked methods
✅ Cannot unlink last auth method
✅ Performance acceptable (<500ms for linking)
✅ No data loss during linking
✅ Proper error messages shown to users

## Common Issues & Solutions

### Issue: "Email not provided by OAuth provider"
**Solution**: User needs to make email public in GitHub settings

### Issue: Two accounts for same person
**Solution**: Use account merge script (account-linking-queries.sql #12)

### Issue: Cannot login after linking
**Solution**: Check user.is_active status, verify tokens

### Issue: Unlink button not working
**Solution**: Check canUnlinkProvider logic, verify user has alternative auth

## Test Data Cleanup

```sql
-- Clean up test accounts
DELETE FROM user_oauth_providers WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@example.com'
);

DELETE FROM user_profiles WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@example.com'
);

DELETE FROM users WHERE email LIKE '%@example.com';
```
