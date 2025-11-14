# Account Linking Flow Diagrams

## Main Flow: OAuth Login with Account Linking

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Clicks "Sign in with GitHub"            │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Redirect to GitHub OAuth                          │
│                    /oauth2/authorization/github                      │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    User Authorizes on GitHub                         │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│              GitHub Redirects Back with OAuth Token                  │
│              /api/v1/auth/oauth/github/callback                      │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    OAuthService.processOAuthLogin()                  │
│                    • Extract email from OAuth response               │
│                    • Extract provider ID (GitHub username)           │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────┐
│              AccountLinkingService.linkOrCreateAccount()             │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
                    ┌───────────────┴───────────────┐
                    │                               │
            User Exists?                      User Exists?
                 YES                               NO
                    │                               │
                    ↓                               ↓
    ┌───────────────────────────┐   ┌──────────────────────────┐
    │  Link GitHub to Existing  │   │   Create New User with   │
    │         Account           │   │         GitHub           │
    │                           │   │                          │
    │  • Add 'github' to        │   │  • email = from GitHub   │
    │    oauthProviders         │   │  • oauthProviders =      │
    │  • Keep existing password │   │    ['github']            │
    │  • Update last_login_at   │   │  • password_hash = NULL  │
    └───────────────────────────┘   └──────────────────────────┘
                    │                               │
                    └───────────────┬───────────────┘
                                    ↓
                    ┌───────────────────────────┐
                    │   Generate JWT Tokens     │
                    │   • Access Token          │
                    │   • Refresh Token         │
                    └───────────────────────────┘
                                    ↓
                    ┌───────────────────────────┐
                    │  Redirect to Frontend     │
                    │  /auth/callback?          │
                    │    accessToken=...        │
                    │    refreshToken=...       │
                    │    userId=...             │
                    │    email=...              │
                    └───────────────────────────┘
                                    ↓
                    ┌───────────────────────────┐
                    │   User Logged In!         │
                    │   Can use BOTH methods    │
                    └───────────────────────────┘
```

## Scenario 1: Manual Account → Add GitHub

```
┌─────────────────────────────────────────────────────────────────────┐
│  Day 1: User Registers Manually                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
                    POST /api/v1/auth/register
                    {
                      "email": "user@example.com",
                      "password": "SecurePass123"
                    }
                                    ↓
                    ┌───────────────────────────┐
                    │  Database State:          │
                    │  ─────────────────────    │
                    │  users:                   │
                    │    email: user@example.com│
                    │    password_hash: $2a$... │
                    │                           │
                    │  user_oauth_providers:    │
                    │    (empty)                │
                    └───────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Day 30: User Logs in with GitHub (same email)                      │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
                    Click "Sign in with GitHub"
                    GitHub returns: user@example.com
                                    ↓
                    AccountLinkingService detects:
                    "User exists with this email!"
                                    ↓
                    Links GitHub to existing account
                                    ↓
                    ┌───────────────────────────┐
                    │  Database State:          │
                    │  ─────────────────────    │
                    │  users:                   │
                    │    email: user@example.com│
                    │    password_hash: $2a$... │
                    │                           │
                    │  user_oauth_providers:    │
                    │    provider: github       │
                    └───────────────────────────┘
                                    ↓
                    ┌───────────────────────────┐
                    │  User can now login with: │
                    │  ✓ Email + Password       │
                    │  ✓ GitHub OAuth           │
                    └───────────────────────────┘
```

## Scenario 2: GitHub First → Add Password

```
┌─────────────────────────────────────────────────────────────────────┐
│  Day 1: User Signs Up with GitHub                                   │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
                    Click "Sign in with GitHub"
                    GitHub returns: oauth@example.com
                                    ↓
                    No existing user found
                                    ↓
                    Create new account
                                    ↓
                    ┌───────────────────────────┐
                    │  Database State:          │
                    │  ─────────────────────    │
                    │  users:                   │
                    │    email: oauth@example.com│
                    │    password_hash: NULL    │
                    │                           │
                    │  user_oauth_providers:    │
                    │    provider: github       │
                    └───────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Day 15: User Sets Password in Settings                             │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
                    POST /api/v1/auth/set-password
                    {
                      "newPassword": "NewSecurePass123"
                    }
                                    ↓
                    ┌───────────────────────────┐
                    │  Database State:          │
                    │  ─────────────────────    │
                    │  users:                   │
                    │    email: oauth@example.com│
                    │    password_hash: $2a$... │
                    │                           │
                    │  user_oauth_providers:    │
                    │    provider: github       │
                    └───────────────────────────┘
                                    ↓
                    ┌───────────────────────────┐
                    │  User can now login with: │
                    │  ✓ Email + Password       │
                    │  ✓ GitHub OAuth           │
                    └───────────────────────────┘
```

## Scenario 3: Unlink Provider (Safety Check)

```
┌─────────────────────────────────────────────────────────────────────┐
│  User Has: Password + GitHub                                        │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
                    User clicks "Disconnect GitHub"
                                    ↓
                    DELETE /api/v1/auth/account/unlink/github
                                    ↓
                    ┌───────────────────────────┐
                    │  Safety Check:            │
                    │  ─────────────────────    │
                    │  hasPassword? YES ✓       │
                    │  hasOtherProviders? NO    │
                    │                           │
                    │  Result: ALLOWED          │
                    └───────────────────────────┘
                                    ↓
                    Remove 'github' from user_oauth_providers
                                    ↓
                    ┌───────────────────────────┐
                    │  User can now login with: │
                    │  ✓ Email + Password       │
                    │  ✗ GitHub OAuth (removed) │
                    └───────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  User Has: GitHub ONLY (no password)                                │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
                    User clicks "Disconnect GitHub"
                                    ↓
                    DELETE /api/v1/auth/account/unlink/github
                                    ↓
                    ┌───────────────────────────┐
                    │  Safety Check:            │
                    │  ─────────────────────    │
                    │  hasPassword? NO ✗        │
                    │  hasOtherProviders? NO    │
                    │                           │
                    │  Result: BLOCKED          │
                    └───────────────────────────┘
                                    ↓
                    ┌───────────────────────────┐
                    │  Error: Cannot unlink     │
                    │  last authentication      │
                    │  method. Set a password   │
                    │  first.                   │
                    └───────────────────────────┘
```

## Edge Case: GitHub Email Not Public

```
┌─────────────────────────────────────────────────────────────────────┐
│  User's GitHub email is private                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    ↓
                    GitHub OAuth callback
                    email = null (not provided)
                                    ↓
                    ┌───────────────────────────┐
                    │  Fallback Logic:          │
                    │  ─────────────────────    │
                    │  Get GitHub username      │
                    │  username = "johndoe"     │
                    │                           │
                    │  Generate fallback email: │
                    │  "johndoe@github.user"    │
                    └───────────────────────────┘
                                    ↓
                    Check if user exists with:
                    "johndoe@github.user"
                                    ↓
                    ┌───────────────┴───────────────┐
                    │                               │
                 Exists?                         Exists?
                  YES                              NO
                    │                               │
                    ↓                               ↓
        Link to existing account      Create new account with
        (unlikely - fallback email)   fallback email
                                                    ↓
                                    ┌───────────────────────────┐
                                    │  ⚠️ LIMITATION:           │
                                    │  If user later makes      │
                                    │  email public, they'll    │
                                    │  have TWO accounts:       │
                                    │                           │
                                    │  1. johndoe@github.user   │
                                    │  2. john@realemail.com    │
                                    │                           │
                                    │  Solution: Account merge  │
                                    └───────────────────────────┘
```

## Database State Transitions

```
State 1: New User (Manual Registration)
┌─────────────────────────────────────┐
│ users                               │
│ ─────────────────────────────────── │
│ id: uuid-1                          │
│ email: user@example.com             │
│ password_hash: $2a$10$...           │
│ is_active: true                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ user_oauth_providers                │
│ ─────────────────────────────────── │
│ (empty)                             │
└─────────────────────────────────────┘

                    ↓ (User logs in with GitHub)

State 2: Linked Account
┌─────────────────────────────────────┐
│ users                               │
│ ─────────────────────────────────── │
│ id: uuid-1                          │
│ email: user@example.com             │
│ password_hash: $2a$10$...           │
│ is_active: true                     │
│ updated_at: 2024-01-15 (changed)    │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ user_oauth_providers                │
│ ─────────────────────────────────── │
│ user_id: uuid-1                     │
│ provider: github                    │
└─────────────────────────────────────┘

                    ↓ (User adds Google OAuth)

State 3: Multiple OAuth Providers
┌─────────────────────────────────────┐
│ users                               │
│ ─────────────────────────────────── │
│ id: uuid-1                          │
│ email: user@example.com             │
│ password_hash: $2a$10$...           │
│ is_active: true                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ user_oauth_providers                │
│ ─────────────────────────────────── │
│ user_id: uuid-1, provider: github   │
│ user_id: uuid-1, provider: google   │
└─────────────────────────────────────┘

                    ↓ (User unlinks GitHub)

State 4: After Unlinking
┌─────────────────────────────────────┐
│ users                               │
│ ─────────────────────────────────── │
│ id: uuid-1                          │
│ email: user@example.com             │
│ password_hash: $2a$10$...           │
│ is_active: true                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ user_oauth_providers                │
│ ─────────────────────────────────── │
│ user_id: uuid-1, provider: google   │
└─────────────────────────────────────┘
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Frontend                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  LinkedAccounts.tsx                                          │  │
│  │  • Display linked providers                                  │  │
│  │  • Connect/Disconnect buttons                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓ ↑                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  accountLinkingService.ts                                    │  │
│  │  • getLinkedProviders()                                      │  │
│  │  • unlinkProvider()                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ ↑
                         HTTP REST API
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────────┐
│                         Backend (Spring Boot)                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  AccountLinkingController                                    │  │
│  │  • GET /account/linked-providers                             │  │
│  │  • DELETE /account/unlink/{provider}                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓ ↑                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  AccountLinkingService                                       │  │
│  │  • linkOrCreateAccount()                                     │  │
│  │  • canLinkAccount()                                          │  │
│  │  • unlinkProvider()                                          │  │
│  │  • getAccountStatus()                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓ ↑                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  OAuthService                                                │  │
│  │  • processOAuthLogin()                                       │  │
│  │  • extractEmail()                                            │  │
│  │  • extractOAuthId()                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓ ↑                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  UserRepository                                              │  │
│  │  • findByEmail()                                             │  │
│  │  • save()                                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ ↑
                         PostgreSQL
                              ↓ ↑
┌─────────────────────────────────────────────────────────────────────┐
│                           Database                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  users                                                       │  │
│  │  • id, email, password_hash, is_active                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  user_oauth_providers                                        │  │
│  │  • user_id, provider                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```
