# GitHub OAuth Setup Guide

This guide will help you set up GitHub OAuth authentication for SkillSync.

## Prerequisites

- A GitHub account
- Backend services running (auth-service on port 8081)
- Frontend running (on port 3000)

## Step 1: Create a GitHub OAuth App

1. Go to your GitHub Settings: https://github.com/settings/developers
2. Click on **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"** button
4. Fill in the application details:
   - **Application name**: `SkillSync` (or any name you prefer)
   - **Homepage URL**: `http://localhost:3000`
   - **Application description**: (optional) `Developer collaboration platform`
   - **Authorization callback URL**: `http://localhost:8081/login/oauth2/code/github`
5. Click **"Register application"**
6. You'll see your **Client ID** - copy it
7. Click **"Generate a new client secret"** button
8. Copy the **Client Secret** (you won't be able to see it again!)

## Step 2: Configure Backend Environment Variables

### Option A: Using Environment Variables (Recommended for Development)

Set these environment variables before starting the auth-service:

**Windows (PowerShell):**
```powershell
$env:GITHUB_CLIENT_ID="your_client_id_here"
$env:GITHUB_CLIENT_SECRET="your_client_secret_here"
```

**Windows (CMD):**
```cmd
set GITHUB_CLIENT_ID=your_client_id_here
set GITHUB_CLIENT_SECRET=your_client_secret_here
```

**Linux/Mac:**
```bash
export GITHUB_CLIENT_ID="your_client_id_here"
export GITHUB_CLIENT_SECRET="your_client_secret_here"
```

### Option B: Using .env File

Create a file named `.env` in the `auth-service` directory:

```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
JWT_SECRET=mySecretKeyForSkillSyncPlatformThatIsLongEnough
FRONTEND_URL=http://localhost:3000
```

**Note:** Make sure to add `.env` to your `.gitignore` file to avoid committing secrets!

### Option C: Update application.yml Directly (Not Recommended for Production)

Edit `auth-service/src/main/resources/application.yml`:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: your_actual_client_id_here
            client-secret: your_actual_client_secret_here
            scope: user:email,read:user
```

## Step 3: Restart the Auth Service

After setting the environment variables, restart your auth-service:

```bash
cd auth-service
mvn spring-boot:run
```

Or if using Docker:
```bash
docker-compose restart auth-service
```

## Step 4: Test the OAuth Flow

1. Open your browser and go to `http://localhost:3000`
2. Click **"Sign in with GitHub"** button on the login or register page
3. You'll be redirected to GitHub to authorize the application
4. After authorization, you'll be redirected back to SkillSync and automatically logged in
5. You should land on the dashboard page

## Troubleshooting

### Issue: "Redirect URI mismatch" error

**Solution:** Make sure the callback URL in your GitHub OAuth App settings exactly matches:
```
http://localhost:8081/login/oauth2/code/github
```

### Issue: "Client authentication failed" error

**Solution:** 
- Verify your Client ID and Client Secret are correct
- Make sure there are no extra spaces or quotes in the environment variables
- Restart the auth-service after setting the variables

### Issue: Stuck on "Completing sign in..." page

**Solution:**
- Check the browser console for errors
- Verify the auth-service is running on port 8081
- Check auth-service logs for any errors

### Issue: "Email not provided by OAuth provider"

**Solution:**
- Make sure your GitHub account has a verified email address
- Go to GitHub Settings → Emails and verify your email
- Make sure your email is set to public or the OAuth app has the correct scopes

## Security Notes

1. **Never commit your Client Secret** to version control
2. For production, use environment variables or a secrets management service
3. Update the callback URL in GitHub OAuth App settings when deploying to production
4. Use HTTPS in production for the callback URL

## Production Deployment

When deploying to production, update:

1. **GitHub OAuth App Settings:**
   - Homepage URL: `https://yourdomain.com`
   - Callback URL: `https://api.yourdomain.com/login/oauth2/code/github`

2. **Backend Environment Variables:**
   ```env
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Frontend authService.ts:**
   Update the OAuth redirect URL to use your production API URL.

## Testing Checklist

- [ ] GitHub OAuth App created
- [ ] Client ID and Secret configured
- [ ] Auth service restarted
- [ ] Can click "Sign in with GitHub" button
- [ ] Redirected to GitHub authorization page
- [ ] After authorization, redirected back to SkillSync
- [ ] Automatically logged in and see dashboard
- [ ] User profile created in database

## Need Help?

If you encounter issues:
1. Check the auth-service logs for detailed error messages
2. Check the browser console for frontend errors
3. Verify all URLs match exactly (no trailing slashes, correct ports)
4. Make sure all services are running (auth-service, frontend)
