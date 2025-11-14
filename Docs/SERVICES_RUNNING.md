# Services Currently Running

## ✅ Running Services

### 1. Auth Service
- **Port**: 8081
- **Status**: ✅ Running
- **Endpoints**:
  - POST `/api/v1/auth/register` - Register new user
  - POST `/api/v1/auth/login` - Login
  - POST `/api/v1/auth/token/refresh` - Refresh token
  - GET `/oauth2/authorization/github` - GitHub OAuth

### 2. User Service  
- **Port**: 8082
- **Status**: ✅ Running
- **Endpoints**:
  - POST `/api/v1/users` - Create profile
  - GET `/api/v1/users/{id}` - Get profile
  - PUT `/api/v1/users/{id}` - Update profile
  - POST `/api/v1/users/{id}/skills` - Add skill
  - GET `/api/v1/users/search` - Search users

### 3. Frontend
- **Port**: 3000
- **Status**: Should be running
- **URL**: http://localhost:3000

## ⚠️ Important Configuration

The frontend is now configured to use **port 8081** (auth-service) for API calls.

This means:
- ✅ Login/Register works (auth-service on 8081)
- ❌ Profile operations won't work yet (user-service on 8082)

## 🔧 What You Need to Do

### Option 1: Use Auth Service Only (Quick Test)

1. **Refresh your browser** at http://localhost:3000
2. **Try to login** - it should work now!
3. After login, profile features won't work yet

### Option 2: Fix API Gateway (Recommended)

The API gateway should route requests:
- Auth requests → port 8081
- User requests → port 8082

But it has a configuration error. To fix it, we need to resolve the bean conflict.

## 🚀 Quick Test

1. **Refresh browser** at http://localhost:3000
2. **Click "Login"**
3. **Enter credentials**:
   - Email: test@example.com
   - Password: password123
4. **Should successfully login!**

## 📋 Next Steps

1. ✅ Test login (should work now)
2. Fix API Gateway to route to both services
3. Then profile features will work

## 🔍 Service URLs

- **Auth Service**: http://localhost:8081
- **User Service**: http://localhost:8082
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080 (not working yet)

## 💡 Temporary Workaround

Since the API gateway isn't working, you can:

1. **For Login**: Frontend → Auth Service (8081) ✅
2. **For Profile**: Need to either:
   - Fix API gateway, OR
   - Update frontend to call user-service directly on 8082

Let me know if you want me to:
- A) Fix the API gateway
- B) Update frontend to call services directly
- C) Just test login for now
