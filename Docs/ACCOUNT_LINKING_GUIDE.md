# Account Linking Implementation Guide

## Overview
This guide explains how SkillSync handles account linking between manual (email/password) and OAuth (GitHub) authentication methods.

## Core Algorithm

### Account Linking Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Attempts OAuth Login                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Extract Email from OAuth Provider               │
│  • Primary: Use email from OAuth response                    │
│  • Fallback (GitHub): Use username@github.user               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Check if User Exists with Email                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    │                   │
              YES   │                   │   NO
                    ↓                   ↓
    ┌───────────────────────┐   ┌──────────────────┐
    │  Link OAuth Provider  │   │  Create New User │
    │  to Existing Account  │   │  with OAuth      │
    └───────────────────────┘   └──────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ↓
                    ┌─────────────────┐
                    │  Generate Tokens│
                    │  & Login User   │
                    └─────────────────┘
```

### Key Principles

1. **Email is the Primary Identifier**: Accounts are linked based on matching email addresses
2. **Automatic Linking**: No user confirmation needed - if emails match, accounts are automatically linked
3. **Safety First**: Users cannot unlink their last authentication method
4. **Transparent**: Users can view all linked providers in their account settings

## Implementation Details

### 1. Database Schema

#### Current Schema (Already Implemented)
```sql
-- users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),  -- NULL for OAuth-only accounts
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    last_login_at TIMESTAMP
);

-- OAuth providers (stored as collection)
CREATE TABLE user_oauth_providers (
    user_id UUID REFERENCES users(id),
    provider VARCHAR(50)  -- 'github', 'google', etc.
);
```

#### Enhanced Schema (Optional - For Advanced Tracking)
```sql
-- Track OAuth provider-specific IDs
CREATE TABLE user_oauth_identities (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);
```

### 2. Account Linking Logic

#### Scenario 1: User Signs Up with Email/Password
```java
// User creates account manually
User user = new User("user@example.com", hashedPassword);
user.setPasswordHash(hashedPassword);
// oauthProviders is empty
```

#### Scenario 2: Same User Logs in with GitHub OAuth
```java
// OAuth callback receives email: user@example.com
// AccountLinkingService.linkOrCreateAccount() is called

// 1. Find existing user by email
Optional<User> existing = userRepository.findByEmail("user@example.com");

// 2. User exists! Link GitHub provider
if (existing.isPresent()) {
    User user = existing.get();
    user.addOauthProvider("github");  // Adds to Set<String>
    userRepository.save(user);
    // Now user can login with BOTH email/password AND GitHub
}
```

#### Scenario 3: User Signs Up with GitHub First
```java
// OAuth callback receives email: user@example.com
// No existing user found

// Create new user with OAuth only
User user = new User();
user.setEmail("user@example.com");
user.addOauthProvider("github");
user.setPasswordHash(null);  // No password yet
```

#### Scenario 4: User Later Adds Password
```java
// User goes to settings and sets a password
user.setPasswordHash(hashedPassword);
// Now user can login with BOTH GitHub AND email/password
```

## Edge Cases & Solutions

### Edge Case 1: GitHub Email Not Public
**Problem**: GitHub user hasn't made their email public

**Solution**:
```java
String email = oAuth2User.getAttribute("email");
if (email == null || email.isEmpty()) {
    String login = oAuth2User.getAttribute("login");
    email = login + "@github.user";  // Fallback
}
```

**Limitation**: If user later makes email public, they'll have two accounts
**Mitigation**: Provide account merging tool (future enhancement)

### Edge Case 2: User Has Multiple GitHub Accounts
**Problem**: User logs in with different GitHub accounts (different emails)

**Solution**: Each email creates a separate SkillSync account
- `personal@gmail.com` → Account A
- `work@company.com` → Account B

**User Action**: User must choose which account to use

### Edge Case 3: Email Changes on OAuth Provider
**Problem**: User changes email on GitHub from `old@email.com` to `new@email.com`

**Current Behavior**: Creates new account with `new@email.com`

**Enhanced Solution** (with `user_oauth_identities` table):
```java
// Check by provider_user_id first
Optional<OAuthIdentity> identity = 
    oauthIdentityRepository.findByProviderAndProviderUserId("github", githubId);

if (identity.isPresent()) {
    // Use existing account even if email changed
    User user = identity.get().getUser();
    // Update email if needed
    if (!user.getEmail().equals(newEmail)) {
        // Optionally notify user of email change
        user.setEmail(newEmail);
    }
}
```

### Edge Case 4: Trying to Unlink Last Auth Method
**Problem**: User tries to unlink GitHub when they have no password

**Solution**:
```java
public boolean unlinkProvider(String email, String provider) {
    User user = findByEmail(email);
    
    boolean hasPassword = user.getPasswordHash() != null;
    boolean hasOtherProviders = user.getOauthProviders().size() > 1;
    
    if (!hasPassword && !hasOtherProviders) {
        throw new IllegalStateException(
            "Cannot unlink last authentication method. " +
            "Please set a password first."
        );
    }
    
    user.getOauthProviders().remove(provider);
    return true;
}
```

### Edge Case 5: Account Disabled/Banned
**Problem**: User's account is disabled, tries to login via OAuth

**Solution**:
```java
public boolean canLinkAccount(String email, String provider) {
    Optional<User> user = userRepository.findByEmail(email);
    
    if (user.isPresent() && !user.get().getIsActive()) {
        throw new AccountDisabledException(
            "This account has been disabled. Please contact support."
        );
    }
    
    return true;
}
```

## User Flows

### Flow 1: Manual Account → Add GitHub OAuth

```
1. User creates account with email/password
   POST /api/v1/auth/register
   { "email": "user@example.com", "password": "..." }

2. User logs in normally
   POST /api/v1/auth/login
   { "email": "user@example.com", "password": "..." }

3. User goes to Settings → Connected Accounts
   GET /api/v1/auth/account/linked-providers
   Response: { "hasPassword": true, "linkedProviders": [] }

4. User clicks "Connect GitHub"
   Redirects to: /oauth2/authorization/github

5. GitHub OAuth callback
   GET /api/v1/auth/oauth/github/callback
   → AccountLinkingService links GitHub to existing account

6. User can now login with EITHER method
   - Email/password: POST /api/v1/auth/login
   - GitHub OAuth: GET /oauth2/authorization/github
```

### Flow 2: GitHub OAuth → Add Password

```
1. User signs up with GitHub
   GET /oauth2/authorization/github
   → Creates account with email from GitHub

2. User profile shows: "Signed in with GitHub"
   GET /api/v1/auth/account/linked-providers
   Response: { "hasPassword": false, "linkedProviders": ["github"] }

3. User goes to Settings → Set Password
   POST /api/v1/auth/set-password
   { "newPassword": "..." }

4. User can now login with EITHER method
```

### Flow 3: Unlink Provider

```
1. User has both password and GitHub linked
   GET /api/v1/auth/account/linked-providers
   Response: { 
     "hasPassword": true, 
     "linkedProviders": ["github"],
     "canUnlinkProvider": true 
   }

2. User clicks "Disconnect GitHub"
   DELETE /api/v1/auth/account/unlink/github

3. GitHub is removed, user can still login with password
```

## Security Considerations

### 1. Email Verification
**Current**: OAuth providers verify emails
**Enhancement**: Add email verification for manual signups

### 2. Account Takeover Prevention
**Risk**: Attacker gains access to user's GitHub account
**Mitigation**: 
- Require re-authentication for sensitive operations
- Send email notifications when new provider is linked
- Allow users to view login history

### 3. Email Collision
**Risk**: Two users claim same email
**Mitigation**: Email is unique in database (enforced by constraint)

### 4. Provider Impersonation
**Risk**: Fake OAuth provider
**Mitigation**: Use official OAuth libraries, verify redirect URIs

## Testing Scenarios

### Test Case 1: Basic Linking
```
1. Create user with email/password
2. Login with GitHub (same email)
3. Verify: user.oauthProviders contains "github"
4. Verify: user.passwordHash is still set
5. Login with email/password → Success
6. Login with GitHub → Success
```

### Test Case 2: Cannot Unlink Last Method
```
1. Create user with GitHub only
2. Attempt to unlink GitHub
3. Verify: Returns error "Cannot unlink last authentication method"
4. Set password
5. Attempt to unlink GitHub
6. Verify: Success
```

### Test Case 3: Multiple Providers
```
1. Create user with email/password
2. Link GitHub
3. Link Google (future)
4. Verify: user.oauthProviders = ["github", "google"]
5. Unlink GitHub
6. Verify: Can still login with password and Google
```

## API Endpoints

### Get Linked Providers
```http
GET /api/v1/auth/account/linked-providers
Authorization: Bearer <token>

Response:
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

Response:
{
  "message": "Provider unlinked successfully",
  "provider": "github"
}
```

## Frontend Integration

### Display Linked Accounts
```typescript
// Frontend component
const LinkedAccounts = () => {
  const { data } = useQuery({
    queryKey: ['linkedProviders'],
    queryFn: () => authService.getLinkedProviders()
  });

  return (
    <div>
      <h3>Connected Accounts</h3>
      {data?.hasPassword && <div>✓ Email/Password</div>}
      {data?.linkedProviders.map(provider => (
        <div key={provider}>
          ✓ {provider}
          {data.canUnlinkProvider && (
            <button onClick={() => unlinkProvider(provider)}>
              Disconnect
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
```

## Future Enhancements

1. **Account Merging Tool**: Allow users to manually merge duplicate accounts
2. **Email Change Handling**: Track OAuth provider IDs to handle email changes
3. **Login History**: Show users where and when they logged in
4. **Two-Factor Authentication**: Add 2FA for enhanced security
5. **Social Profile Sync**: Sync profile picture and name from OAuth providers
6. **Multiple Email Addresses**: Allow users to add multiple verified emails

## Monitoring & Logging

### Key Metrics to Track
- Number of accounts with multiple auth methods
- OAuth linking success rate
- Failed linking attempts (and reasons)
- Accounts created via each provider

### Log Examples
```
INFO: Linked github provider to existing account: user@example.com
WARN: Cannot link to inactive account: banned@example.com
ERROR: Email extraction failed for provider: github
```

## Rollback Plan

If issues arise:
1. Disable automatic linking in `AccountLinkingService`
2. Require manual confirmation before linking
3. Provide account separation tool
4. Restore from database backup if needed

## Summary

This implementation provides:
- ✅ Automatic account linking by email
- ✅ Support for multiple auth methods per account
- ✅ Safety checks (can't unlink last method)
- ✅ User control (view and manage linked accounts)
- ✅ Handles edge cases (missing email, inactive accounts)
- ✅ Extensible (easy to add more OAuth providers)
