# GitHub Email Verification Guide

## Current Configuration ✅

**OAuth Scope**: `user:email,read:user`
- ✅ Requests access to user's email addresses
- ✅ Requests access to user profile information

**Account Linking Logic**:
1. GitHub returns user data with email
2. System extracts email from OAuth response
3. System checks if user exists with that email
4. If exists → Links GitHub to existing account
5. If not exists → Creates new account

## How to Verify Your GitHub Email Settings

### Option 1: Check GitHub Settings (Recommended)

1. Go to https://github.com/settings/emails
2. Look for your primary email: `vk5022702@gmail.com`
3. **Important**: Check if "Keep my email addresses private" is UNCHECKED
4. If it's checked, GitHub won't share your email with OAuth apps

### Option 2: Test GitHub API Directly

You can test what GitHub will return by making an API call:

```bash
# Get your GitHub personal access token from:
# https://github.com/settings/tokens (with 'user:email' scope)

# Then test:
curl -H "Authorization: token YOUR_GITHUB_TOKEN" https://api.github.com/user
```

This will show you what data GitHub provides, including the email field.

## Expected Behavior

### Scenario 1: Email is Public ✅
```
GitHub returns: { "email": "vk5022702@gmail.com", ... }
↓
System finds existing user with vk5022702@gmail.com
↓
Links GitHub to existing account
↓
You can login with BOTH email/password AND GitHub
```

### Scenario 2: Email is Private ⚠️
```
GitHub returns: { "email": null, "login": "vinaykumaru2k3", ... }
↓
System uses fallback: "vinaykumaru2k3@github.user"
↓
No existing user with that email
↓
Creates NEW account (separate from your email account)
```

## How to Make Your GitHub Email Public

1. Go to https://github.com/settings/emails
2. Find the section "Keep my email addresses private"
3. **UNCHECK** this option
4. Save changes
5. Now try the OAuth login

## Logs to Monitor

When you login with GitHub, check the auth-service logs for:

```
Processing OAuth login for provider: github
OAuth user attributes: {email=vk5022702@gmail.com, login=vinaykumaru2k3, ...}
```

If you see:
- ✅ `email=vk5022702@gmail.com` → Will link to existing account
- ⚠️ `email=null` → Will use fallback and create separate account

## Testing the Flow

### Step 1: Check Current Database State
```sql
-- Your current account
SELECT id, email, password_hash IS NOT NULL as has_password 
FROM users 
WHERE email = 'vk5022702@gmail.com';

-- Result: 
-- id: 5c845ec6-90d7-4429-a0fa-cf06ea01b4de
-- email: vk5022702@gmail.com
-- has_password: true
```

### Step 2: Login with GitHub
1. Go to http://localhost:3000
2. Click "Sign in with GitHub"
3. Authorize the app

### Step 3: Verify Linking
```sql
-- Check if GitHub was linked
SELECT 
    u.email,
    u.password_hash IS NOT NULL as has_password,
    STRING_AGG(uop.provider, ', ') as oauth_providers
FROM users u
LEFT JOIN user_oauth_providers uop ON u.id = uop.user_id
WHERE u.email = 'vk5022702@gmail.com'
GROUP BY u.id, u.email, u.password_hash;

-- Expected result if linking worked:
-- email: vk5022702@gmail.com
-- has_password: true
-- oauth_providers: github
```

### Step 4: Test Both Login Methods
1. Logout
2. Login with email/password → Should work ✅
3. Logout
4. Login with GitHub → Should work ✅

## Troubleshooting

### Issue: Two accounts created
**Cause**: GitHub email was private, used fallback email

**Solution**:
1. Make GitHub email public
2. Delete the fallback account:
   ```sql
   DELETE FROM user_oauth_providers WHERE user_id IN (
       SELECT id FROM users WHERE email LIKE '%@github.user'
   );
   DELETE FROM user_roles WHERE user_id IN (
       SELECT id FROM users WHERE email LIKE '%@github.user'
   );
   DELETE FROM users WHERE email LIKE '%@github.user';
   ```
3. Try GitHub login again

### Issue: "Email not provided by OAuth provider"
**Cause**: GitHub email is private AND username couldn't be extracted

**Solution**: Make your GitHub email public

### Issue: Account linking didn't work
**Check**:
1. Are the emails exactly the same? (case-insensitive)
2. Check auth-service logs for the email GitHub returned
3. Verify the user exists in database before OAuth login

## Quick Verification Command

Run this before attempting GitHub login:

```powershell
# Check your current account
docker exec -i skillsync-postgres psql -U skillsync -d auth_service -c "SELECT id, email, password_hash IS NOT NULL as has_password FROM users WHERE email = 'vk5022702@gmail.com';"

# Expected output:
#                   id                  |        email        | has_password
# --------------------------------------+---------------------+--------------
#  5c845ec6-90d7-4429-a0fa-cf06ea01b4de | vk5022702@gmail.com | t
```

## Summary

✅ **Configuration is correct** - OAuth scope includes `user:email`
✅ **Account linking logic is implemented** - Will link if emails match
⚠️ **Critical**: Your GitHub email MUST be public for automatic linking

**Action Required**:
1. Go to https://github.com/settings/emails
2. Uncheck "Keep my email addresses private"
3. Ensure `vk5022702@gmail.com` is your primary email
4. Then try GitHub login

The system will automatically link GitHub to your existing account if the emails match!
