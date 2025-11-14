# Revoke and Re-authorize GitHub OAuth App

## Problem
GitHub cached the old authorization (when your email was private), so it's still not sending your email even though you updated the settings.

## Solution: Revoke the App and Re-authorize

### Step 1: Revoke the OAuth App
1. Go to: https://github.com/settings/applications
2. Click on the "Authorized OAuth Apps" tab
3. Find your SkillSync app (or the app with client ID from your .env)
4. Click "Revoke" or the three dots menu → "Revoke"

### Step 2: Clear Browser Cache (Optional but Recommended)
- Press `Ctrl + Shift + Delete`
- Clear cookies and cached data for the last hour

### Step 3: Try GitHub Login Again
1. Go to http://localhost:3000
2. Click "Sign in with GitHub"
3. GitHub will ask you to authorize again (with the new email settings)
4. Click "Authorize"

This time GitHub will send your real email!

## Alternative: Check GitHub OAuth Scope

If the app doesn't appear in your authorized apps, the issue might be the OAuth scope. Let me verify the configuration is requesting email access properly.

The scope should include `user:email` which it does, but GitHub might need explicit permission to share the email.

## What Should Happen

After revoking and re-authorizing:
```
1. GitHub OAuth → Requests email permission
2. You authorize → GitHub shares vk5022702@gmail.com
3. System finds existing account
4. Links GitHub to your account
5. Success! ✅
```

## Verify It Worked

After logging in, check:
```powershell
docker exec -i skillsync-postgres psql -U skillsync -d auth_service -c "SELECT u.email, STRING_AGG(uop.provider, ', ') as providers FROM users u LEFT JOIN user_oauth_providers uop ON u.id = uop.user_id GROUP BY u.email;"
```

You should see:
```
        email        | providers
---------------------+-----------
 vk5022702@gmail.com | github
```

NOT:
```
           email            | providers
----------------------------+-----------
 vinaykumaru2k3@github.user | github
```
