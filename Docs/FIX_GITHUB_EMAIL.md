# Fix GitHub Email for Account Linking

## Problem
GitHub is not sharing your email with the OAuth app, so it's using a fallback email (`vinaykumaru2k3@github.user`) instead of your real email (`vk5022702@gmail.com`).

## Solution: Make Your GitHub Email Public

### Step 1: Go to GitHub Email Settings
Open this link: https://github.com/settings/emails

### Step 2: Uncheck "Keep my email addresses private"
Look for this section:
```
☐ Keep my email addresses private
```
**UNCHECK this box!**

### Step 3: Verify Your Primary Email
Make sure `vk5022702@gmail.com` is listed and marked as "Primary"

### Step 4: Save Changes
GitHub will now share your email with OAuth apps

### Step 5: Test Again
1. Go to http://localhost:3000
2. Click "Sign in with GitHub"
3. Authorize the app
4. This time it should link to your existing account!

## How to Verify It Worked

After logging in with GitHub, run this command:

```powershell
docker exec -i skillsync-postgres psql -U skillsync -d auth_service -c "SELECT u.email, u.password_hash IS NOT NULL as has_password, STRING_AGG(uop.provider, ', ') as oauth_providers FROM users u LEFT JOIN user_oauth_providers uop ON u.id = uop.user_id WHERE u.email = 'vk5022702@gmail.com' GROUP BY u.id, u.email, u.password_hash;"
```

**Expected result:**
```
        email        | has_password | oauth_providers
---------------------+--------------+-----------------
 vk5022702@gmail.com | t            | github
```

If you see `github` in the oauth_providers column, it worked! ✅

## Alternative: Use GitHub Email Scope

If you don't want to make your email public, you can also:

1. Go to https://github.com/settings/emails
2. Check "Allow my verified email addresses to be used by third-party applications"
3. This allows OAuth apps to access your email without making it public

## Current Status

✅ Deleted the fallback account (`vinaykumaru2k3@github.user`)
✅ Your email account is ready: `vk5022702@gmail.com`
⏳ Waiting for you to update GitHub settings
🔄 Then try GitHub login again

## Quick Check

Before trying again, you can verify what GitHub will return by checking:
https://github.com/settings/emails

Look for:
- ☐ Keep my email addresses private (should be UNCHECKED)
- ☑ Allow my verified email addresses to be used by third-party applications (should be CHECKED)
